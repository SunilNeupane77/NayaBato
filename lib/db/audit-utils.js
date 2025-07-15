import Audit from '@/models/Audit';
import Notification from '@/models/Notification';

/**
 * Create a new record with audit logging and notifications
 * @param {Object} options - Function options
 * @param {Object} options.model - Mongoose model to create record in
 * @param {Object} options.data - Data to create the record with
 * @param {Object} options.actor - User performing the action
 * @param {Object} options.requestInfo - Request metadata like IP and user agent
 * @param {Boolean} options.notify - Whether to create notifications
 * @param {Array} options.notifyUsers - User IDs to notify (if notify is true)
 * @param {String} options.notifyMessage - Notification message template
 * @returns {Object} Created document
 */
export async function createWithAudit({
  model,
  data,
  actor,
  requestInfo = {},
  notify = false,
  notifyUsers = [],
  notifyMessage = '',
  notifyTitle = ''
}) {
  // Start a session for transaction
  const session = await model.db.startSession();
  let createdDoc;
  
  try {
    await session.withTransaction(async () => {
      // Create the document
      createdDoc = await model.create([data], { session });
      createdDoc = createdDoc[0]; // Unwrap from array
      
      // Create audit log entry
      await Audit.create([{
        actor: actor?._id || null,
        action: 'create',
        resourceType: model.modelName,
        resourceId: createdDoc._id,
        details: { data },
        ipAddress: requestInfo.ip,
        userAgent: requestInfo.userAgent
      }], { session });
      
      // Create notifications if enabled
      if (notify && notifyUsers.length > 0) {
        const notifications = notifyUsers.map(userId => ({
          recipient: userId,
          title: notifyTitle || `New ${model.modelName}`,
          message: notifyMessage || `A new ${model.modelName.toLowerCase()} has been created`,
          type: 'system',
          referenceId: createdDoc._id,
          referenceModel: model.modelName
        }));
        
        await Notification.create(notifications, { session });
      }
    });
    
    return createdDoc;
  } catch (error) {
    console.error(`Error in createWithAudit for ${model.modelName}:`, error);
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Update a record with audit logging and notifications
 * @param {Object} options - Function options
 * @param {Object} options.model - Mongoose model
 * @param {String|ObjectId} options.id - Document ID to update
 * @param {Object} options.updates - Data to update
 * @param {Object} options.actor - User performing the action
 * @param {Object} options.requestInfo - Request metadata like IP and user agent
 * @param {Boolean} options.notify - Whether to create notifications
 * @param {Array} options.notifyUsers - User IDs to notify (if notify is true)
 * @param {String} options.notifyMessage - Notification message template
 * @returns {Object} Updated document
 */
export async function updateWithAudit({
  model,
  id,
  updates,
  actor,
  requestInfo = {},
  notify = false,
  notifyUsers = [],
  notifyMessage = '',
  notifyTitle = ''
}) {
  // Start a session for transaction
  const session = await model.db.startSession();
  let updatedDoc;
  
  try {
    await session.withTransaction(async () => {
      // Find original document for comparison
      const originalDoc = await model.findById(id).session(session);
      
      if (!originalDoc) {
        throw new Error(`${model.modelName} not found with ID ${id}`);
      }
      
      // Update the document
      updatedDoc = await model.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true, session }
      );
      
      // Create audit log entry
      await Audit.create([{
        actor: actor?._id || null,
        action: 'update',
        resourceType: model.modelName,
        resourceId: updatedDoc._id,
        details: { 
          before: originalDoc.toObject(),
          after: updatedDoc.toObject(),
          changes: updates
        },
        ipAddress: requestInfo.ip,
        userAgent: requestInfo.userAgent
      }], { session });
      
      // Create notifications if enabled
      if (notify && notifyUsers.length > 0) {
        const notifications = notifyUsers.map(userId => ({
          recipient: userId,
          title: notifyTitle || `${model.modelName} Updated`,
          message: notifyMessage || `A ${model.modelName.toLowerCase()} has been updated`,
          type: 'system',
          referenceId: updatedDoc._id,
          referenceModel: model.modelName
        }));
        
        await Notification.create(notifications, { session });
      }
    });
    
    return updatedDoc;
  } catch (error) {
    console.error(`Error in updateWithAudit for ${model.modelName}:`, error);
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Delete a record with audit logging
 * @param {Object} options - Function options
 * @param {Object} options.model - Mongoose model
 * @param {String|ObjectId} options.id - Document ID to delete
 * @param {Object} options.actor - User performing the action
 * @param {Object} options.requestInfo - Request metadata like IP and user agent
 * @returns {Object} Deleted document
 */
export async function deleteWithAudit({
  model,
  id,
  actor,
  requestInfo = {}
}) {
  // Start a session for transaction
  const session = await model.db.startSession();
  let deletedDoc;
  
  try {
    await session.withTransaction(async () => {
      // Find document to delete
      deletedDoc = await model.findById(id).session(session);
      
      if (!deletedDoc) {
        throw new Error(`${model.modelName} not found with ID ${id}`);
      }
      
      // Store document data before deletion
      const docData = deletedDoc.toObject();
      
      // Delete the document
      await model.deleteOne({ _id: id }).session(session);
      
      // Create audit log entry
      await Audit.create([{
        actor: actor?._id || null,
        action: 'delete',
        resourceType: model.modelName,
        resourceId: id,
        details: { deletedDocument: docData },
        ipAddress: requestInfo.ip,
        userAgent: requestInfo.userAgent
      }], { session });
    });
    
    return deletedDoc;
  } catch (error) {
    console.error(`Error in deleteWithAudit for ${model.modelName}:`, error);
    throw error;
  } finally {
    session.endSession();
  }
}
