import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import {
  CURRENT_USER_ID,
  seedGroups,
  seedNotifications,
  seedPosts,
  seedUsers,
} from './src/data';
import { GroupFeedScreen } from './src/screens/GroupFeedScreen';
import { GroupsScreen } from './src/screens/GroupsScreen';
import { NewPostScreen, NewPostInput } from './src/screens/NewPostScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { ReviewCheckInScreen } from './src/screens/ReviewCheckInScreen';
import { colors } from './src/theme';
import {
  AppNotification,
  FOUR_WEEKS_MS,
  Group,
  ProductPost,
  Review,
} from './src/types';

type Route =
  | { name: 'groups' }
  | { name: 'feed'; groupId: string }
  | { name: 'newPost'; groupId: string }
  | { name: 'review'; postId: string }
  | { name: 'notifications' };

let idCounter = 100;
const nextId = (prefix: string) => `${prefix}${idCounter++}`;

export default function App() {
  const [route, setRoute] = useState<Route>({ name: 'groups' });
  const [groups, setGroups] = useState<Group[]>(seedGroups);
  const [posts, setPosts] = useState<ProductPost[]>(seedPosts);
  const [notifications, setNotifications] =
    useState<AppNotification[]>(seedNotifications);

  /**
   * Der 4-Wochen-Check: erzeugt für jeden fälligen, unbewerteten eigenen Post
   * eine Check-in-Benachrichtigung. Im echten Backend übernimmt das ein
   * Scheduler mit Push-Versand — hier läuft er beim Start und danach jede Minute.
   */
  const runDueCheck = useCallback(() => {
    const now = Date.now();
    setNotifications((current) => {
      const additions: AppNotification[] = [];
      for (const post of posts) {
        const due =
          !post.review &&
          post.reviewDueAt <= now &&
          post.authorId === CURRENT_USER_ID;
        const alreadyNotified = current.some(
          (n) => n.type === 'review_due' && n.postId === post.id
        );
        if (due && !alreadyNotified) {
          additions.push({
            id: nextId('n'),
            type: 'review_due',
            userId: CURRENT_USER_ID,
            postId: post.id,
            text: `⏰ 4 Wochen sind um: Wie findest Du "${post.title}"? Zeit für Deine Bewertung!`,
            createdAt: now,
            read: false,
          });
        }
      }
      return additions.length ? [...current, ...additions] : current;
    });
  }, [posts]);

  useEffect(() => {
    runDueCheck();
    const interval = setInterval(runDueCheck, 60 * 1000);
    return () => clearInterval(interval);
  }, [runDueCheck]);

  const createGroup = (name: string) => {
    const code = `${
      name
        .replace(/[^a-zA-Z]/g, '')
        .slice(0, 5)
        .toUpperCase() || 'GRUPPE'
    }-${Math.floor(100 + Math.random() * 900)}`;
    setGroups((g) => [
      ...g,
      {
        id: nextId('g'),
        name,
        inviteCode: code,
        memberIds: [CURRENT_USER_ID],
      },
    ]);
  };

  const addPost = (groupId: string, input: NewPostInput) => {
    const now = Date.now();
    setPosts((p) => [
      {
        id: nextId('p'),
        groupId,
        authorId: CURRENT_USER_ID,
        createdAt: now,
        reviewDueAt: now + FOUR_WEEKS_MS,
        ...input,
      },
      ...p,
    ]);
    setRoute({ name: 'feed', groupId });
  };

  /** Demo-Helfer: springt für einen Post 4 Wochen in die Zukunft. */
  const simulateFourWeeks = (postId: string) => {
    setPosts((p) =>
      p.map((post) =>
        post.id === postId ? { ...post, reviewDueAt: Date.now() - 1000 } : post
      )
    );
  };

  /**
   * Bewertung speichern. Bei einer Empfehlung wird der Broadcast an alle
   * anderen Gruppenmitglieder ausgelöst (im echten Backend: Push an jedes
   * Mitglied + optional ab in den Warenkorb via Shop-Link).
   */
  const submitReview = (postId: string, review: Omit<Review, 'createdAt'>) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const fullReview: Review = { ...review, createdAt: Date.now() };
    setPosts((p) =>
      p.map((item) =>
        item.id === postId ? { ...item, review: fullReview } : item
      )
    );

    if (review.recommended) {
      const group = groups.find((g) => g.id === post.groupId);
      const author = seedUsers.find((u) => u.id === post.authorId);
      const recipients =
        group?.memberIds.filter((id) => id !== post.authorId) ?? [];
      const broadcast: AppNotification[] = recipients.map((userId) => ({
        id: nextId('n'),
        type: 'recommendation' as const,
        userId,
        postId,
        text: `✨ ${author?.name ?? 'Jemand'} empfiehlt: ${post.title} (${
          review.rating
        }/5)${review.comment ? ` — „${review.comment}“` : ''}`,
        createdAt: Date.now(),
        read: false,
      }));
      setNotifications((n) => [...n, ...broadcast]);
    }

    setRoute({ name: 'feed', groupId: post.groupId });
  };

  const myNotifications = notifications.filter(
    (n) => n.userId === CURRENT_USER_ID
  );
  const unreadCount = myNotifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((n) =>
      n.map((item) =>
        item.userId === CURRENT_USER_ID ? { ...item, read: true } : item
      )
    );

  let screen: React.ReactNode = null;
  if (route.name === 'groups') {
    screen = (
      <GroupsScreen
        groups={groups}
        users={seedUsers}
        unreadCount={unreadCount}
        onOpenGroup={(groupId) => setRoute({ name: 'feed', groupId })}
        onOpenNotifications={() => setRoute({ name: 'notifications' })}
        onCreateGroup={createGroup}
      />
    );
  } else if (route.name === 'feed') {
    const group = groups.find((g) => g.id === route.groupId);
    screen = group ? (
      <GroupFeedScreen
        group={group}
        posts={posts
          .filter((p) => p.groupId === group.id)
          .sort((a, b) => b.createdAt - a.createdAt)}
        users={seedUsers}
        onBack={() => setRoute({ name: 'groups' })}
        onNewPost={() => setRoute({ name: 'newPost', groupId: group.id })}
        onOpenReview={(postId) => setRoute({ name: 'review', postId })}
        onSimulateFourWeeks={simulateFourWeeks}
      />
    ) : null;
  } else if (route.name === 'newPost') {
    const group = groups.find((g) => g.id === route.groupId);
    screen = group ? (
      <NewPostScreen
        group={group}
        onBack={() => setRoute({ name: 'feed', groupId: group.id })}
        onSubmit={(input) => addPost(group.id, input)}
      />
    ) : null;
  } else if (route.name === 'review') {
    const post = posts.find((p) => p.id === route.postId);
    screen = post ? (
      <ReviewCheckInScreen
        post={post}
        onBack={() => setRoute({ name: 'feed', groupId: post.groupId })}
        onSubmit={(review) => submitReview(post.id, review)}
      />
    ) : null;
  } else if (route.name === 'notifications') {
    screen = (
      <NotificationsScreen
        notifications={myNotifications}
        onBack={() => {
          markAllRead();
          setRoute({ name: 'groups' });
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      {screen}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
});
