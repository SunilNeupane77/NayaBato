import connectDB from '@/lib/db/connect';
import Comment from '@/models/Comment';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Get, update or delete a specific comment by ID
 * @route GET|PUT|DELETE /api/comments/[id]
 */
export async function GET(request, { params }) {
  try {
    // Await params before destructuring
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    // Connect to database
    await connectDB();
    
    // Find the comment
    const comment = await Comment.findById(id)
      .populate('author', 'name email role');
    
    if (!comment) {
      return NextResponse.json(
        { success: false, message: 'Comment not found' },
        { status: 404 }
      );
    }
    
    // Check if comment is internal and user has permission
    const session = await getServerSession(authOptions);
    const isOfficial = session?.user && ['admin', 'official'].includes(session.user.role);
    
    if (comment.isInternal && !isOfficial) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to access this comment' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({
      success: true,
      comment
    });
    
  } catch (error) {
    console.error(`Error fetching comment ${params.id}:`, error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching comment' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    // Await params before destructuring
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    
    // Get session and verify permission
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Find the comment
    const comment = await Comment.findById(id);
    
    if (!comment) {
      return NextResponse.json(
        { success: false, message: 'Comment not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the author or admin
    const isAuthor = comment.author.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this comment' },
        { status: 403 }
      );
    }
    
    // Only allow updating content or internal status
    const updateData = {};
    if (body.content) updateData.content = body.content;
    if (isAdmin && body.isInternal !== undefined) updateData.isInternal = body.isInternal;
    
    // Update the comment
    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name email role');
    
    return NextResponse.json({
      success: true,
      comment: updatedComment
    });
    
  } catch (error) {
    console.error(`Error updating comment ${params.id}:`, error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error updating comment' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // Await params before destructuring
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    // Get session and verify permission
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Find the comment
    const comment = await Comment.findById(id);
    
    if (!comment) {
      return NextResponse.json(
        { success: false, message: 'Comment not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the author or admin
    const isAuthor = comment.author.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete this comment' },
        { status: 403 }
      );
    }
    
    // Delete the comment
    await Comment.deleteOne({ _id: id });
    
    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully'
    });
    
  } catch (error) {
    console.error(`Error deleting comment ${params.id}:`, error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error deleting comment' },
      { status: 500 }
    );
  }
}
