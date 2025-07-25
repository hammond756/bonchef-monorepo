# Product Requirements Document: Recipe Comments Feature

## 🎯 **Executive Summary**

Implement a comprehensive recipe comments system that enables users to engage with recipes and chefs through comments, fostering community interaction and increasing user engagement on the Bonchef platform.

## 📋 **Business Objectives**

### **Primary Goals**

- **User Engagement**: Increase time spent on recipe pages through social interaction
- **Community Building**: Foster connections between users and recipe creators
- **Content Generation**: Create user-generated content that enhances SEO
- **Platform Stickiness**: Encourage return visits through social features

### **Success Metrics**

- **Comment Volume**: Target 5+ comments per popular recipe within 3 months
- **User Participation**: 15% of active users post at least one comment
- **Engagement Time**: 20% increase in average time spent on recipe pages
- **Return Rate**: 25% increase in users returning to view recipe updates

## 👥 **User Stories**

### **As a Recipe Viewer**

- I want to read comments from other users about recipes
- I want to ask questions about ingredients or cooking techniques
- I want to share my cooking experience with a recipe
- I want to see how many people have commented on a recipe

### **As a Recipe Creator**

- I want to see feedback and comments on my recipes
- I want to respond to questions about my recipes
- I want to understand what users like about my recipes
- I want to build a following through recipe interactions

### **As a Community Member**

- I want to discover new recipes through comment discussions
- I want to share cooking tips and modifications
- I want to connect with other cooking enthusiasts
- I want to learn from others' cooking experiences

## 🎨 **UI/UX Requirements**

### **Comment Button Location**

- **Primary Location**: Recipe action buttons (next to like, bookmark, share)
- **Secondary Location**: Recipe detail page header
- **Visual Design**: Message circle icon with comment count
- **States**: Default, hover, active, loading

### **Comment Overlay Interaction**

- **Trigger**: Click on comment button
- **Animation**: Slide-in from right side
- **Layout**: Full-height overlay with header, content, and input
- **Responsive**: Mobile-first design with touch-friendly interactions

### **Comment Overlay Content**

- **Header**: "Reacties" title with close button
- **Recipe Description**: Show recipe description if available
- **Comment List**: Chronological list of comments with user info
- **Comment Input**: Text area with character limit and send button
- **Empty State**: "Nog geen reacties" message when no comments exist

### **Comment Item Design**

- **User Info**: Avatar, display name, timestamp
- **Comment Text**: Formatted text with proper line breaks
- **Actions**: Delete button (for comment owner only)
- **Timestamp**: Relative time (e.g., "2u", "45m") or absolute date

### **Closing Behavior**

- **Close Button**: X button in header
- **Outside Click**: Close overlay when clicking outside
- **Escape Key**: Close overlay with ESC key
- **Navigation**: Close when navigating away from page

### **Reusability**

- **Component Structure**: Modular components for reuse
- **Props Interface**: Flexible props for different contexts
- **Styling**: Theme-aware styling (light/dark modes)
- **Accessibility**: Full keyboard navigation and screen reader support

## 🏗️ **Technical Architecture**

### **Database Schema**

```sql
-- Comments table
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    text TEXT NOT NULL CHECK (char_length(text) <= 500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_comments_recipe_id ON public.comments(recipe_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);

-- Functions for comment count and user interaction
CREATE FUNCTION get_comment_count(rec recipes) RETURNS bigint AS $$
    SELECT COUNT(*) FROM public.comments WHERE recipe_id = rec.id;
$$ LANGUAGE sql STABLE;

CREATE FUNCTION has_commented_by_current_user(rec recipes) RETURNS boolean AS $$
    SELECT EXISTS(
        SELECT 1 FROM public.comments
        WHERE recipe_id = rec.id AND user_id = auth.uid()
    );
$$ LANGUAGE sql STABLE;
```

### **API Endpoints**

```typescript
// Get comments for a recipe
GET /api/recipes/[id]/comments
Response: Comment[]

// Create a new comment
POST /api/recipes/[id]/comments
Body: { text: string }
Response: Comment

// Delete a comment
DELETE /api/comments/[id]
Response: { success: boolean }
```

### **Component Architecture**

```typescript
// Main components
CommentButton - Action button with count display
CommentOverlay - Slide-in overlay container
CommentList - Scrollable list of comments
CommentItem - Individual comment display
CommentInput - Comment creation form

// Supporting components
SlideInOverlay - Reusable overlay with animations
CommentCount - Display comment count with zero-text logic

// Hooks
useComments - Fetch and manage comments
useCommentActions - Create/delete comment operations
useCommentCount - Optimistic count management
```

### **State Management**

- **Local State**: Component-level state for UI interactions
- **Server State**: React Query for API data management
- **Optimistic Updates**: Immediate UI updates before server confirmation
- **Error Handling**: Graceful error states with user feedback

## 🔒 **Security & Privacy**

### **Authentication**

- **Required**: Users must be logged in to comment
- **Ownership**: Users can only delete their own comments
- **Rate Limiting**: Prevent spam with reasonable limits

### **Content Moderation**

- **Character Limit**: 500 characters per comment
- **Input Sanitization**: Prevent XSS attacks
- **Report System**: Allow users to report inappropriate content
- **Admin Tools**: Moderation interface for content management

### **Data Protection**

- **GDPR Compliance**: User data handling and deletion
- **Privacy Controls**: User control over comment visibility
- **Data Retention**: Clear policies for comment storage

## 📱 **Responsive Design**

### **Mobile-First Approach**

- **Touch Targets**: Minimum 44px touch targets
- **Swipe Gestures**: Support for swipe-to-close overlay
- **Keyboard**: Full keyboard navigation support
- **Screen Readers**: ARIA labels and semantic HTML

### **Breakpoint Strategy**

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### **Performance Considerations**

- **Lazy Loading**: Load comments on demand
- **Virtualization**: Handle large comment lists efficiently
- **Caching**: Smart caching strategies for comment data
- **Optimization**: Minimize bundle size and loading times

## 🧪 **Testing Strategy**

### **Unit Tests**

- **Component Tests**: Test individual component behavior
- **Hook Tests**: Test custom hooks for data management
- **Service Tests**: Test API service functions
- **Utility Tests**: Test helper functions and utilities

### **Integration Tests**

- **API Tests**: Test complete API workflows
- **Database Tests**: Test database operations and constraints
- **Authentication Tests**: Test user authentication flows
- **Error Handling Tests**: Test error scenarios and recovery

### **E2E Tests**

- **User Flows**: Complete comment creation and viewing flows
- **Cross-Browser**: Test on multiple browsers and devices
- **Accessibility**: Test with screen readers and keyboard navigation
- **Performance**: Test loading times and responsiveness

## 🚀 **Implementation Phases**

### **Phase 1: Core Infrastructure**

- Database schema and migrations
- Basic API endpoints
- Core component structure
- Authentication integration

### **Phase 2: UI Implementation**

- Comment button and overlay
- Comment list and item components
- Comment input and validation
- Responsive design implementation

### **Phase 3: Advanced Features**

- Optimistic updates
- Real-time notifications
- Comment moderation tools
- Analytics and reporting

### **Phase 4: Polish & Optimization**

- Performance optimization
- Accessibility improvements
- User testing and feedback
- Documentation and training

## 📊 **Analytics & Monitoring**

### **Key Metrics**

- **Comment Volume**: Total comments created
- **User Engagement**: Comments per user
- **Recipe Popularity**: Comments per recipe
- **Response Time**: Time to first comment

### **Error Tracking**

- **API Errors**: Monitor API endpoint failures
- **Client Errors**: Track JavaScript errors
- **Performance**: Monitor loading times and responsiveness
- **User Feedback**: Collect user-reported issues

### **A/B Testing**

- **Button Placement**: Test different comment button locations
- **Overlay Design**: Test different overlay animations
- **Character Limits**: Test different text length limits
- **Notification Timing**: Test different notification strategies

## 🔄 **Future Enhancements**

### **Short Term (3-6 months)**

- **Comment Replies**: Nested comment threading
- **Comment Reactions**: Like/dislike comments
- **Comment Editing**: Allow users to edit their comments
- **Comment Search**: Search within recipe comments

### **Medium Term (6-12 months)**

- **Comment Moderation**: Advanced moderation tools
- **Comment Analytics**: Detailed engagement metrics
- **Comment Notifications**: Real-time notification system
- **Comment Export**: Export comment data for users

### **Long Term (12+ months)**

- **Comment Communities**: Recipe-specific discussion groups
- **Comment Gamification**: Points and badges for engagement
- **Comment AI**: AI-powered content moderation
- **Comment Integration**: Integration with social media platforms

## ✅ **Acceptance Criteria**

### **Functional Requirements**

- [ ] Users can view comments on recipe pages
- [ ] Users can create new comments (when logged in)
- [ ] Users can delete their own comments
- [ ] Comment count is displayed on recipe cards
- [ ] Comments are displayed in chronological order
- [ ] Character limit is enforced (500 characters)
- [ ] Empty state is shown when no comments exist

### **Non-Functional Requirements**

- [ ] Comments load within 2 seconds
- [ ] Overlay opens/closes smoothly with animations
- [ ] Mobile-responsive design works on all screen sizes
- [ ] Keyboard navigation is fully supported
- [ ] Screen reader compatibility is maintained
- [ ] Error states are handled gracefully
- [ ] Performance impact is minimal (<10% increase in bundle size)

### **Quality Assurance**

- [ ] All components have unit tests with >90% coverage
- [ ] E2E tests cover all critical user flows
- [ ] Accessibility tests pass WCAG 2.1 AA standards
- [ ] Performance tests meet defined benchmarks
- [ ] Security tests validate input sanitization
- [ ] Cross-browser compatibility is verified

## 📚 **Documentation Requirements**

### **Technical Documentation**

- **API Documentation**: Complete API endpoint documentation
- **Component Documentation**: Storybook stories for all components
- **Database Documentation**: Schema and migration documentation
- **Deployment Guide**: Step-by-step deployment instructions

### **User Documentation**

- **Feature Guide**: User guide for comment functionality
- **FAQ**: Common questions and answers
- **Troubleshooting**: Common issues and solutions
- **Best Practices**: Guidelines for effective commenting

### **Maintenance Documentation**

- **Monitoring Guide**: How to monitor comment system health
- **Troubleshooting Guide**: Common issues and resolution steps
- **Update Procedures**: How to update and maintain the system
- **Backup Procedures**: Data backup and recovery procedures
