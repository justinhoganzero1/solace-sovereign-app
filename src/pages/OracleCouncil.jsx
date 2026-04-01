import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowLeft, ThumbsUp, ThumbsDown, Plus, Users, MessageSquare, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import AnimatedOracle from '../components/oracle/AnimatedOracle';
import { FuturisticOrb } from '../components/ui/futuristic-cloud';

export default function OracleCouncil() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'ideas', tags: '' });
  const [userVotes, setUserVotes] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const allPosts = await base44.entities.ForumPost.list('-upvotes', 100);
      setPosts(allPosts);

      const allGroups = await base44.entities.CommunityGroup.list();
      setGroups(allGroups);

      const votes = await base44.entities.PostVote.filter({ created_by: currentUser.email });
      const voteMap = {};
      votes.forEach(vote => {
        voteMap[vote.post_id] = vote.vote_type;
      });
      setUserVotes(voteMap);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleVote = async (postId, voteType) => {
    try {
      const existingVote = userVotes[postId];
      
      if (existingVote === voteType) {
        // Remove vote
        const votes = await base44.entities.PostVote.filter({ 
          created_by: user.email, 
          post_id: postId 
        });
        if (votes.length > 0) {
          await base44.entities.PostVote.delete(votes[0].id);
        }
        
        const post = posts.find(p => p.id === postId);
        const updateData = voteType === 'upvote' 
          ? { upvotes: post.upvotes - 1 }
          : { downvotes: post.downvotes - 1 };
        await base44.entities.ForumPost.update(postId, updateData);
        
        setUserVotes(prev => {
          const updated = { ...prev };
          delete updated[postId];
          return updated;
        });
      } else {
        // Add or change vote
        if (existingVote) {
          const votes = await base44.entities.PostVote.filter({ 
            created_by: user.email, 
            post_id: postId 
          });
          if (votes.length > 0) {
            await base44.entities.PostVote.delete(votes[0].id);
          }
          
          const post = posts.find(p => p.id === postId);
          const updateData = existingVote === 'upvote'
            ? { upvotes: post.upvotes - 1, downvotes: post.downvotes + 1 }
            : { upvotes: post.upvotes + 1, downvotes: post.downvotes - 1 };
          await base44.entities.ForumPost.update(postId, updateData);
        } else {
          const post = posts.find(p => p.id === postId);
          const updateData = voteType === 'upvote'
            ? { upvotes: post.upvotes + 1 }
            : { downvotes: post.downvotes + 1 };
          await base44.entities.ForumPost.update(postId, updateData);
        }
        
        await base44.entities.PostVote.create({ post_id: postId, vote_type: voteType });
        setUserVotes(prev => ({ ...prev, [postId]: voteType }));
      }
      
      await loadData();
      toast.success('Vote recorded');
    } catch (error) {
      toast.error('Failed to vote');
    }
  };

  const handleCreatePost = async () => {
    try {
      const tagsArray = newPost.tags.split(',').map(t => t.trim()).filter(t => t);
      
      // Create post
      const post = await base44.entities.ForumPost.create({
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        tags: tagsArray
      });
      
      // AI moderation check
      try {
        const modResult = await base44.functions.invoke('moderateContent', {
          post_id: post.id,
          content: newPost.content,
          title: newPost.title
        });
        
        if (!modResult.data.is_safe) {
          toast.warning('Post flagged for review by AI moderator');
        }
      } catch (error) {
        console.log('Moderation check failed, post still created');
      }
      
      // Award XP and credits
      await base44.entities.EmpireCredit.create({
        amount: 25,
        transaction_type: 'forum_post',
        description: 'Created forum post'
      });
      
      await base44.functions.invoke('awardXP', {
        xp_amount: 20,
        reason: 'Created forum post'
      });
      
      // Update empire level post count
      const levels = await base44.entities.EmpireLevel.filter({ created_by: user.email });
      if (levels.length > 0) {
        await base44.entities.EmpireLevel.update(levels[0].id, {
          total_forum_posts: (levels[0].total_forum_posts || 0) + 1
        });
      }
      
      toast.success('Post created! +25 credits, +20 XP');
      setShowCreatePost(false);
      setNewPost({ title: '', content: '', category: 'ideas', tags: '' });
      loadData();
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(p => p.category === selectedCategory);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="fixed inset-0 z-0 opacity-30">
        <AnimatedOracle gender="female" />
      </div>

      <div className="relative z-10 min-h-screen p-6">
        <div className="mb-6">
          <Link to={createPageUrl('Home')}>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <FuturisticOrb size="sm" glowColor="purple">
                <ArrowLeft className="w-6 h-6 text-purple-400" />
              </FuturisticOrb>
            </motion.button>
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Users className="w-20 h-20 text-purple-400 mx-auto mb-4 drop-shadow-[0_0_40px_rgba(168,85,247,0.9)]" />
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 mb-2">
            Oracle's Council
          </h1>
          <p className="text-xl text-gray-300">Share, Collaborate, Create</p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <TabsList className="bg-gray-800/50 backdrop-blur-sm">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="ideas">Ideas</TabsTrigger>
                <TabsTrigger value="creations">Creations</TabsTrigger>
                <TabsTrigger value="collaborations">Collaborations</TabsTrigger>
                <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button onClick={() => setShowCreatePost(true)} className="ml-4 bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </div>

          {showCreatePost && (
            <Card className="mb-6 bg-gray-900/70 backdrop-blur-sm border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-400">Create Post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Post title..."
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="bg-gray-800 border-gray-700"
                />
                <Textarea
                  placeholder="Share your ideas, creations, or questions..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="bg-gray-800 border-gray-700 min-h-32"
                />
                <Input
                  placeholder="Tags (comma separated)..."
                  value={newPost.tags}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                  className="bg-gray-800 border-gray-700"
                />
                <div className="flex gap-2">
                  <Button onClick={handleCreatePost} className="bg-purple-600 hover:bg-purple-700">
                    Post (+25 credits)
                  </Button>
                  <Button onClick={() => setShowCreatePost(false)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {filteredPosts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-gray-900/70 backdrop-blur-sm border-gray-800 hover:border-purple-500/50 transition-all">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-purple-300 text-lg">{post.title}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          by {post.created_by} • {new Date(post.created_date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full">
                        {post.category}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">{post.content}</p>
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex gap-2 mb-4 flex-wrap">
                        {post.tags.map((tag, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-4 items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(post.id, 'upvote')}
                        className={userVotes[post.id] === 'upvote' ? 'text-green-400' : 'text-gray-400'}
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        {post.upvotes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(post.id, 'downvote')}
                        className={userVotes[post.id] === 'downvote' ? 'text-red-400' : 'text-gray-400'}
                      >
                        <ThumbsDown className="w-4 h-4 mr-1" />
                        {post.downvotes}
                      </Button>
                      <div className="text-gray-500 text-sm flex items-center">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        0 comments
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {groups.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-purple-400 mb-4">Active Groups</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {groups.slice(0, 6).map((group) => (
                  <Card key={group.id} className="bg-gray-900/70 backdrop-blur-sm border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-purple-300 text-sm">{group.group_name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-gray-400 mb-2">{group.description}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Users className="w-3 h-3 mr-1" />
                        {group.member_count} members
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}