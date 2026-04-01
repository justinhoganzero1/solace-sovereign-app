import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowLeft, Calendar, Users, Trophy, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import AnimatedOracle from '../components/oracle/AnimatedOracle';
import { FuturisticOrb } from '../components/ui/futuristic-cloud';

export default function CommunityHub() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    type: 'meetup',
    start_date: '',
    max_participants: 50
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const allEvents = await base44.entities.CommunityEvent.list('-start_date', 50);
      setEvents(allEvents.filter(e => new Date(e.start_date) >= new Date()));

      const allGroups = await base44.entities.CommunityGroup.list();
      setGroups(allGroups);

      const memberships = await base44.entities.GroupMembership.filter({ created_by: currentUser.email });
      setMyGroups(memberships);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleCreateEvent = async () => {
    try {
      await base44.entities.CommunityEvent.create({
        event_name: newEvent.name,
        description: newEvent.description,
        event_type: newEvent.type,
        start_date: new Date(newEvent.start_date).toISOString(),
        end_date: new Date(new Date(newEvent.start_date).getTime() + 2 * 60 * 60 * 1000).toISOString(),
        host_email: user.email,
        participants: [user.email],
        max_participants: newEvent.max_participants
      });

      await base44.functions.invoke('awardXP', {
        xp_amount: 50,
        reason: 'Created community event'
      });

      toast.success('Event created! +50 XP');
      setShowCreateEvent(false);
      setNewEvent({ name: '', description: '', type: 'meetup', start_date: '', max_participants: 50 });
      loadData();
    } catch (error) {
      toast.error('Failed to create event');
    }
  };

  const handleJoinEvent = async (eventId, currentParticipants) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (currentParticipants.includes(user.email)) {
        toast.info('Already joined');
        return;
      }

      await base44.entities.CommunityEvent.update(eventId, {
        participants: [...currentParticipants, user.email]
      });

      toast.success('Joined event!');
      loadData();
    } catch (error) {
      toast.error('Failed to join');
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await base44.entities.GroupMembership.create({
        group_id: groupId
      });

      const group = groups.find(g => g.id === groupId);
      await base44.entities.CommunityGroup.update(groupId, {
        member_count: (group.member_count || 0) + 1
      });

      toast.success('Joined group!');
      loadData();
    } catch (error) {
      toast.error('Failed to join group');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="fixed inset-0 z-0 opacity-20">
        <AnimatedOracle gender="female" />
      </div>

      <div className="relative z-10 min-h-screen p-6">
        <div className="mb-6">
          <Link to={createPageUrl('Home')}>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <FuturisticOrb size="sm" glowColor="green">
                <ArrowLeft className="w-6 h-6 text-green-400" />
              </FuturisticOrb>
            </motion.button>
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Users className="w-20 h-20 text-green-400 mx-auto mb-4 drop-shadow-[0_0_40px_rgba(34,197,94,0.9)]" />
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 mb-2">
            Community Hub
          </h1>
          <p className="text-xl text-gray-300">Events, Groups & Connections</p>
        </motion.div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Events Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold text-green-400 flex items-center gap-2">
                <Calendar className="w-8 h-8" />
                Upcoming Events
              </h2>
              <Button onClick={() => setShowCreateEvent(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>

            {showCreateEvent && (
              <Card className="mb-6 bg-gray-900/70 backdrop-blur-sm border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400">Create Community Event</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Event name..."
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                  <Textarea
                    placeholder="Event description..."
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="bg-gray-800 border-gray-700 min-h-24"
                  />
                  <Input
                    type="datetime-local"
                    value={newEvent.start_date}
                    onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleCreateEvent} className="bg-green-600 hover:bg-green-700">
                      Create (+50 XP)
                    </Button>
                    <Button onClick={() => setShowCreateEvent(false)} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {events.map((event) => (
                <Card key={event.id} className="bg-gray-900/70 backdrop-blur-sm border-green-500/30">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-green-300">{event.event_name}</CardTitle>
                      <Badge className="bg-green-900">{event.event_type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-gray-300">{event.description}</p>
                    <div className="text-sm text-gray-400">
                      <div>📅 {new Date(event.start_date).toLocaleString()}</div>
                      <div>👤 {event.participants?.length || 0} / {event.max_participants} participants</div>
                      <div>🎁 Reward: {event.reward_xp} XP + {event.reward_credits} credits</div>
                    </div>
                    {!event.participants?.includes(user?.email) && (
                      <Button 
                        onClick={() => handleJoinEvent(event.id, event.participants || [])}
                        size="sm"
                        className="w-full"
                      >
                        Join Event
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Groups Section */}
          <div>
            <h2 className="text-3xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Users className="w-8 h-8" />
              Community Groups
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {groups.map((group) => {
                const isMember = myGroups.some(m => m.group_id === group.id);
                return (
                  <Card key={group.id} className="bg-gray-900/70 backdrop-blur-sm border-cyan-500/30">
                    <CardHeader>
                      <CardTitle className="text-cyan-300 text-sm">{group.group_name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-xs text-gray-400">{group.description}</p>
                      <Badge className="bg-cyan-900">{group.category}</Badge>
                      <div className="text-xs text-gray-500">
                        {group.member_count || 0} members
                      </div>
                      {!isMember && (
                        <Button 
                          onClick={() => handleJoinGroup(group.id)}
                          size="sm"
                          className="w-full"
                        >
                          Join Group
                        </Button>
                      )}
                      {isMember && (
                        <Badge className="w-full justify-center bg-green-600">Member</Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}