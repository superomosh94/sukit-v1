import React, { useState } from 'react';
import { useCollaborationStore } from '../../stores/collaborationStore';
import { MessageSquare, History, Users, Bell, Send, CheckCircle, XCircle, UserPlus, RotateCcw, Globe, X, Eye, Edit3, Shield, ArrowUpCircle, CheckSquare } from 'lucide-react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';

const TABS = [
  { id: 'collaborators', label: 'Team', icon: Users },
  { id: 'comments', label: 'Comments', icon: MessageSquare },
  { id: 'history', label: 'History', icon: History },
  { id: 'notifications', label: 'Activity', icon: Bell },
];

const PublishFlow = ({ status, onClose }) => {
  const { setPublishStatus } = useCollaborationStore();
  const steps = [
    { key: 'draft', label: 'Draft', icon: Edit3, desc: 'Still working on it' },
    { key: 'review', label: 'In Review', icon: Eye, desc: 'Ready for feedback' },
    { key: 'published', label: 'Published', icon: Globe, desc: 'Live to the world' },
  ];
  const currentIdx = steps.findIndex((s) => s.key === status);
  const canAdvance = currentIdx < steps.length - 1;
  const canRetreat = currentIdx > 0;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-primary">Publish Workflow</h3>
        <button onClick={onClose} className="text-text-secondary hover:text-primary"><X className="w-4 h-4" /></button>
      </div>
      <div className="space-y-3">
        {steps.map((step, i) => {
          const isActive = i === currentIdx;
          const isPast = i < currentIdx;
          const Icon = step.icon;
          return (
            <div key={step.key} className={`flex items-center gap-3 p-3 rounded-lg border ${
              isActive ? 'border-primary-500 bg-primary-50' : 'border-border'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isPast ? 'bg-green-100 text-green-600' : isActive ? 'bg-primary-500 text-white' : 'bg-gray-100 text-text-secondary'
              }`}>
                {isPast ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isActive ? 'text-primary-500' : 'text-text-primary'}`}>{step.label}</p>
                <p className="text-xs text-text-secondary">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        {canRetreat && (
          <Button onClick={() => { setPublishStatus(steps[currentIdx - 1].key); }} variant="secondary" className="flex-1">
            <ArrowUpCircle className="w-4 h-4 mr-1" /> Move to {steps[currentIdx - 1].label}
          </Button>
        )}
        {canAdvance && (
          <Button onClick={() => { setPublishStatus(steps[currentIdx + 1].key); }} variant="primary" className="flex-1">
            <CheckSquare className="w-4 h-4 mr-1" /> Move to {steps[currentIdx + 1].label}
          </Button>
        )}
      </div>
    </div>
  );
};

const CollaboratorsTab = () => {
  const { collaborators, addCollaborator, removeCollaborator, updateCollaboratorRole, publishStatus } = useCollaborationStore();
  const [inviteEmail, setInviteEmail] = useState('');

  const handleInvite = () => {
    if (inviteEmail) {
      addCollaborator(inviteEmail);
      setInviteEmail('');
    }
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center gap-2">
        <input type="email" placeholder="Invite by email..." value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="flex-1 px-3 py-2 bg-surface border border-border rounded text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-primary-500" />
        <button onClick={handleInvite} className="p-2 bg-primary-500 text-white rounded hover:bg-primary-600"><UserPlus className="w-4 h-4" /></button>
      </div>
      <div className="flex items-center justify-between py-1 px-1">
        <span className="text-xs font-medium text-text-secondary">Status: <span className={`font-semibold ${
          publishStatus === 'published' ? 'text-green-600' : publishStatus === 'review' ? 'text-yellow-600' : 'text-text-secondary'
        }`}>{publishStatus}</span></span>
      </div>
      {collaborators.map((user) => (
        <div key={user.id} className="flex items-center gap-2 py-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium" style={{ backgroundColor: user.color }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-text-primary truncate">{user.name}</p>
            <p className="text-xs text-text-secondary truncate">{user.email}</p>
          </div>
          <div className="flex items-center gap-1">
            <select value={user.role} onChange={(e) => updateCollaboratorRole(user.id, e.target.value)} className="text-xs px-1 py-0.5 bg-surface border border-border rounded text-text-secondary">
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
            {user.id !== 'user-1' && (
              <button onClick={() => removeCollaborator(user.id)} className="p-1 text-text-secondary hover:text-red-500"><XCircle className="w-3 h-3" /></button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const CommentsTab = () => {
  const { comments, addComment, resolveComment, addReply, getUserName } = useCollaborationStore();
  const [newComment, setNewComment] = useState('');
  const [replyText, setReplyText] = useState({});

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment('', newComment);
      setNewComment('');
    }
  };

  const handleReply = (commentId) => {
    if (replyText[commentId]?.trim()) {
      addReply(commentId, replyText[commentId]);
      setReplyText({ ...replyText, [commentId]: '' });
    }
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex gap-2">
        <input type="text" placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddComment()} className="flex-1 px-3 py-2 bg-surface border border-border rounded text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-primary-500" />
        <button onClick={handleAddComment} className="p-2 bg-primary-500 text-white rounded hover:bg-primary-600"><Send className="w-4 h-4" /></button>
      </div>
      {comments.length === 0 && <p className="text-xs text-text-secondary text-center py-4">No comments yet</p>}
      {comments.map((comment) => (
        <div key={comment.id} className={`p-2 rounded-lg border ${comment.resolved ? 'border-green-200 bg-green-50' : 'border-border'}`}>
          <div className="flex items-start justify-between">
            <p className="text-xs font-medium text-text-primary">{getUserName(comment.authorId)}</p>
            <div className="flex items-center gap-1">
              {!comment.resolved && (
                <button onClick={() => resolveComment(comment.id)} className="text-xs text-green-600 hover:text-green-700"><CheckCircle className="w-3 h-3" /></button>
              )}
              {comment.resolved && <span className="text-xs text-green-600"><CheckCircle className="w-3 h-3" /></span>}
            </div>
          </div>
          <p className={`text-sm mt-1 ${comment.resolved ? 'text-green-700 line-through' : 'text-text-primary'}`}>{comment.text}</p>
          <div className="mt-2 space-y-1">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="ml-3 pl-2 border-l-2 border-gray-200">
                <p className="text-xs font-medium text-text-primary">{getUserName(reply.authorId)}</p>
                <p className="text-xs text-text-secondary">{reply.text}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-1 mt-2">
            <input type="text" placeholder="Reply..." value={replyText[comment.id] || ''} onChange={(e) => setReplyText({ ...replyText, [comment.id]: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleReply(comment.id)} className="flex-1 px-2 py-1 bg-surface border border-border rounded text-xs text-text-primary placeholder-text-secondary focus:outline-none" />
            <button onClick={() => handleReply(comment.id)} className="px-2 py-1 text-xs bg-primary-500 text-white rounded hover:bg-primary-600">Reply</button>
          </div>
        </div>
      ))}
    </div>
  );
};

const HistoryTab = () => {
  const { versions, saveVersion, restoreVersion, getUserName } = useCollaborationStore();
  const [label, setLabel] = useState('');

  const handleSave = () => {
    if (label.trim()) {
      saveVersion(label, {});
      setLabel('');
    }
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex gap-2">
        <input type="text" placeholder="Version label..." value={label} onChange={(e) => setLabel(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSave()} className="flex-1 px-3 py-2 bg-surface border border-border rounded text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-primary-500" />
        <button onClick={handleSave} className="px-3 py-2 bg-primary-500 text-white text-sm rounded hover:bg-primary-600">Save</button>
      </div>
      {versions.map((v) => (
        <div key={v.id} className="flex items-center justify-between p-2 rounded-lg border border-border hover:bg-gray-50">
          <div>
            <p className="text-sm font-medium text-text-primary">{v.label}</p>
            <p className="text-xs text-text-secondary">{getUserName(v.authorId)} · {new Date(v.timestamp).toLocaleDateString()}</p>
          </div>
          <button onClick={() => restoreVersion(v.id)} className="p-1.5 text-text-secondary hover:text-primary-500 rounded hover:bg-gray-100"><RotateCcw className="w-3.5 h-3.5" /></button>
        </div>
      ))}
    </div>
  );
};

const NotificationsTab = () => {
  const { activityFeed, notifications, markNotificationRead, markAllNotificationsRead } = useCollaborationStore();
  const [feedType, setFeedType] = useState('notifications');

  return (
    <div className="p-3 space-y-3">
      <div className="flex gap-1 bg-surface-light rounded-lg p-1">
        <button onClick={() => setFeedType('notifications')} className={`flex-1 px-3 py-1.5 text-xs rounded font-medium transition-colors ${feedType === 'notifications' ? 'bg-surface shadow-sm text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
          Notifications ({notifications.filter(n => !n.read).length})
        </button>
        <button onClick={() => setFeedType('activity')} className={`flex-1 px-3 py-1.5 text-xs rounded font-medium transition-colors ${feedType === 'activity' ? 'bg-surface shadow-sm text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
          Activity
        </button>
      </div>
      {feedType === 'notifications' ? (
        <>
          {notifications.filter(n => !n.read).length > 0 && (
            <button onClick={markAllNotificationsRead} className="text-xs text-primary-500 hover:underline">Mark all as read</button>
          )}
          {notifications.length === 0 ? (
            <p className="text-xs text-text-secondary text-center py-4">No notifications</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} onClick={() => markNotificationRead(n.id)} className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors ${n.read ? 'opacity-60' : 'bg-primary-50 border border-primary-100'}`}>
                <div className={`w-2 h-2 mt-1 rounded-full flex-shrink-0 ${n.type === 'success' ? 'bg-green-500' : n.type === 'error' ? 'bg-red-500' : 'bg-primary-500'}`} />
                <div>
                  <p className="text-sm text-text-primary">{n.message}</p>
                  <p className="text-xs text-text-secondary">{new Date(n.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </>
      ) : (
        <>
          {activityFeed.length === 0 ? (
            <p className="text-xs text-text-secondary text-center py-4">No activity yet</p>
          ) : (
            activityFeed.map((a) => (
              <div key={a.id} className="flex items-start gap-2 py-1.5">
                <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Shield className="w-3 h-3" />
                </div>
                <div>
                  <p className="text-sm text-text-primary">{a.action}</p>
                  <p className="text-xs text-text-secondary">{new Date(a.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
};

const CollaborationPanel = () => {
  const [activeTab, setActiveTab] = useState('collaborators');
  const [showPublish, setShowPublish] = useState(false);
  const { publishStatus } = useCollaborationStore();

  const statusColors = {
    draft: 'bg-gray-200 text-text-secondary',
    review: 'bg-yellow-100 text-yellow-700',
    published: 'bg-green-100 text-green-700',
  };

  return (
    <div className="w-80 border-l border-border bg-surface flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <h2 className="text-sm font-semibold text-primary">Collaboration</h2>
        <button onClick={() => setShowPublish(true)} className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[publishStatus] || 'bg-gray-200 text-text-secondary'}`}>
          {publishStatus}
        </button>
      </div>

      <div className="flex border-b border-border">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
                isActive ? 'text-primary-500 border-b-2 border-primary-500' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'collaborators' && <CollaboratorsTab />}
        {activeTab === 'comments' && <CommentsTab />}
        {activeTab === 'history' && <HistoryTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
      </div>

      <Modal isOpen={showPublish} onClose={() => setShowPublish(false)} title="Publish Workflow" size="sm">
        <PublishFlow status={publishStatus} onClose={() => setShowPublish(false)} />
      </Modal>
    </div>
  );
};

export default CollaborationPanel;
