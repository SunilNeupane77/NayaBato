import { v4 as uuidv4 } from 'uuid';
import UserSession from '@/models/UserSession';
import UserActivity from '@/models/UserActivity';
import connectDB from '@/lib/db/connect';

export class SessionTracker {
  static async createSession(userId, request = null) {
    try {
      await connectDB();
      
      const sessionId = uuidv4();
      const userAgent = request?.headers?.get?.('user-agent') || 
                       request?.headers?.['user-agent'] || 
                       'unknown';
      const ipAddress = request?.headers?.get?.('x-forwarded-for') || 
                       request?.headers?.get?.('x-real-ip') || 
                       request?.headers?.['x-forwarded-for'] ||
                       request?.headers?.['x-real-ip'] ||
                       'unknown';

      // Parse user agent for device info
      const device = this.parseUserAgent(userAgent);
      
      // Get location info (you might want to integrate with a geolocation service)
      const location = await this.getLocationFromIP(ipAddress);

      const session = new UserSession({
        userId,
        sessionId,
        ipAddress,
        userAgent,
        device,
        location,
        loginTime: new Date(),
        lastActivity: new Date(),
        isActive: true
      });

      await session.save();

      // Track login activity (non-blocking)
      this.trackActivity(userId, sessionId, 'login', null, request).catch(console.error);

      return sessionId;
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  }

  static async updateSession(sessionId, userId = null) {
    try {
      await connectDB();
      
      const query = sessionId ? { sessionId } : { userId, isActive: true };
      const session = await UserSession.findOne(query);
      
      if (session) {
        session.lastActivity = new Date();
        await session.save();
      }
    } catch (error) {
      console.error('Error updating session:', error);
    }
  }

  static async endSession(sessionId) {
    try {
      await connectDB();
      
      const session = await UserSession.findOne({ sessionId });
      if (session) {
        session.isActive = false;
        session.logoutTime = new Date();
        session.sessionDuration = Math.floor(
          (session.logoutTime - session.loginTime) / (1000 * 60)
        ); // duration in minutes
        await session.save();

        // Track logout activity
        await this.trackActivity(session.userId, sessionId, 'logout');
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  static async trackActivity(userId, sessionId, action, resource = null, request = null, metadata = {}) {
    try {
      await connectDB();

      const activity = new UserActivity({
        userId,
        sessionId,
        action,
        resource,
        page: request?.url || metadata.page || 'unknown',
        method: request?.method || 'unknown',
        ipAddress: request?.headers?.get?.('x-forwarded-for') || 
                  request?.headers?.get?.('x-real-ip') ||
                  request?.headers?.['x-forwarded-for'] ||
                  request?.headers?.['x-real-ip'] ||
                  'unknown',
        userAgent: request?.headers?.get?.('user-agent') ||
                  request?.headers?.['user-agent'] ||
                  'unknown',
        referrer: request?.headers?.get?.('referer') ||
                 request?.headers?.['referer'] ||
                 'unknown',
        metadata
      });

      await activity.save();

      // Update session last activity
      if (sessionId) {
        await this.updateSession(sessionId);
      }
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }

  static parseUserAgent(userAgent) {
    const device = {
      browser: 'Unknown',
      os: 'Unknown',
      isMobile: false
    };

    // Simple user agent parsing (you might want to use a library like ua-parser-js)
    if (userAgent.includes('Chrome')) device.browser = 'Chrome';
    else if (userAgent.includes('Firefox')) device.browser = 'Firefox';
    else if (userAgent.includes('Safari')) device.browser = 'Safari';
    else if (userAgent.includes('Edge')) device.browser = 'Edge';

    if (userAgent.includes('Windows')) device.os = 'Windows';
    else if (userAgent.includes('Mac')) device.os = 'macOS';
    else if (userAgent.includes('Linux')) device.os = 'Linux';
    else if (userAgent.includes('Android')) device.os = 'Android';
    else if (userAgent.includes('iOS')) device.os = 'iOS';

    device.isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);

    return device;
  }

  static async getLocationFromIP(ipAddress) {
    // Placeholder for IP geolocation
    // You can integrate with services like ipapi.co, ipgeolocation.io, etc.
    try {
      if (ipAddress === 'unknown' || ipAddress.includes('127.0.0.1') || ipAddress.includes('::1')) {
        return {
          country: 'Local',
          city: 'Local',
          region: 'Local',
          timezone: 'UTC'
        };
      }

      // Example integration with ipapi.co (free tier)
      // const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
      // const data = await response.json();
      // return {
      //   country: data.country_name,
      //   city: data.city,
      //   region: data.region,
      //   timezone: data.timezone
      // };

      return {
        country: 'Unknown',
        city: 'Unknown',
        region: 'Unknown',
        timezone: 'UTC'
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return {
        country: 'Unknown',
        city: 'Unknown',
        region: 'Unknown',
        timezone: 'UTC'
      };
    }
  }

  static async cleanupOldSessions(daysOld = 30) {
    try {
      await connectDB();
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      await UserSession.deleteMany({
        lastActivity: { $lt: cutoffDate },
        isActive: false
      });

      await UserActivity.deleteMany({
        createdAt: { $lt: cutoffDate }
      });
    } catch (error) {
      console.error('Error cleaning up old sessions:', error);
    }
  }
}

export default SessionTracker;
