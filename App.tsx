import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import {
  CURRENT_USER_ID,
  seedGroups,
  seedNotifications,
  seedPosts,
  seedSponsored,
  seedTikTokSaves,
  seedUsers,
  seedWishlist,
} from './src/data';
import { TabBar, TabKey } from './src/components/TabBar';
import { GroupFeedScreen } from './src/screens/GroupFeedScreen';
import { GroupsScreen } from './src/screens/GroupsScreen';
import { ListsScreen, MyItemsFilter } from './src/screens/ListsScreen';
import { MyItemsScreen } from './src/screens/MyItemsScreen';
import { NewPostScreen, NewPostInput } from './src/screens/NewPostScreen';
import { NewsfeedScreen } from './src/screens/NewsfeedScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ReviewCheckInScreen } from './src/screens/ReviewCheckInScreen';
import { ReviewDetailScreen } from './src/screens/ReviewDetailScreen';
import { ShareImportScreen } from './src/screens/ShareImportScreen';
import { TikTokImportScreen } from './src/screens/TikTokImportScreen';
import { WishlistScreen } from './src/screens/WishlistScreen';
import { WriteReviewScreen } from './src/screens/WriteReviewScreen';
import {
  AESTHETICS,
  DEFAULT_AESTHETIC_ID,
  ThemeContext,
} from './src/theme';
import {
  AppNotification,
  badgesFor,
  canPostPublic,
  FOUR_WEEKS_MS,
  Group,
  HELPFUL_POINTS,
  ProductPost,
  Review,
  TikTokSave,
  User,
  WishlistItem,
} from './src/types';

type Route =
  | { name: 'newsfeed' }
  | { name: 'groups' }
  | { name: 'write' }
  | { name: 'lists' }
  | { name: 'myItems'; filter: MyItemsFilter }
  | { name: 'feed'; groupId: string }
  | { name: 'newPost'; groupId: string }
  | { name: 'review'; postId: string }
  | { name: 'notifications' }
  | { name: 'profile' }
  | { name: 'wishlist' }
  | { name: 'tiktokImport' }
  | { name: 'shareImport' }
  | {
      name: 'reviewDetail';
      postId: string;
      origin: 'newsfeed' | 'feed' | 'tested' | 'recommended';
    };

/** Welcher Tab in der Bottom-Bar zu welcher Route gehört. */
function tabForRoute(route: Route): TabKey {
  switch (route.name) {
    case 'groups':
    case 'feed':
    case 'newPost':
      return 'groups';
    case 'write':
    case 'review':
      return 'write';
    case 'lists':
    case 'myItems':
    case 'wishlist':
    case 'tiktokImport':
    case 'shareImport':
      return 'lists';
    default:
      return 'feed';
  }
}

const TAB_ROOTS: Record<TabKey, Route> = {
  feed: { name: 'newsfeed' },
  groups: { name: 'groups' },
  write: { name: 'write' },
  lists: { name: 'lists' },
};

let idCounter = 100;
const nextId = (prefix: string) => `${prefix}${idCounter++}`;

export default function App() {
  const [route, setRoute] = useState<Route>({ name: 'newsfeed' });
  const [aestheticId, setAestheticId] = useState(DEFAULT_AESTHETIC_ID);
  const themeColors = (
    AESTHETICS.find((a) => a.id === aestheticId) ?? AESTHETICS[0]
  ).colors;
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [groups, setGroups] = useState<Group[]>(seedGroups);
  const [posts, setPosts] = useState<ProductPost[]>(seedPosts);
  const [notifications, setNotifications] =
    useState<AppNotification[]>(seedNotifications);
  const [wishlist, setWishlist] = useState<WishlistItem[]>(seedWishlist);
  const [tiktokSaves, setTiktokSaves] =
    useState<TikTokSave[]>(seedTikTokSaves);

  const currentUser = users.find((u) => u.id === CURRENT_USER_ID)!;
  const wishlistTitles = wishlist.map((w) => w.title.toLowerCase());

  const addToWishlist = (item: Omit<WishlistItem, 'id' | 'addedAt'>) => {
    setWishlist((list) =>
      list.some((w) => w.title.toLowerCase() === item.title.toLowerCase())
        ? list
        : [...list, { ...item, id: nextId('w'), addedAt: Date.now() }]
    );
  };

  const addPostToWishlist = (post: ProductPost) =>
    addToWishlist({
      title: post.title,
      brand: post.brand,
      imageUrl: post.photoUri,
      shopLink: post.shopLink,
      source: 'empfehlung',
    });

  /** Ausgewählte TikTok-Saves auf die Wishlist übernehmen. */
  const importTikTokSaves = (saveIds: string[]) => {
    for (const save of tiktokSaves.filter((s) => saveIds.includes(s.id))) {
      addToWishlist({
        title: save.productGuess,
        brand: save.brand,
        source: 'tiktok',
      });
    }
    setTiktokSaves((saves) =>
      saves.map((s) =>
        saveIds.includes(s.id) ? { ...s, imported: true } : s
      )
    );
    setRoute({ name: 'wishlist' });
  };

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
        helpfulUserIds: [],
        ...input,
      },
      ...p,
    ]);
    setRoute({ name: 'feed', groupId });
  };

  /**
   * „Hilfreich“-Stimme auf eine Empfehlung: die Autorin bekommt Punkte,
   * und beim Überschreiten einer Badge-Schwelle eine Badge-Benachrichtigung.
   */
  const markHelpful = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post || post.helpfulUserIds.includes(CURRENT_USER_ID)) return;

    setPosts((p) =>
      p.map((item) =>
        item.id === postId
          ? {
              ...item,
              helpfulUserIds: [...item.helpfulUserIds, CURRENT_USER_ID],
            }
          : item
      )
    );

    const author = users.find((u) => u.id === post.authorId);
    if (!author) return;
    const newPoints = author.points + HELPFUL_POINTS;
    setUsers((all) =>
      all.map((u) =>
        u.id === author.id ? { ...u, points: newPoints } : u
      )
    );

    const voter = users.find((u) => u.id === CURRENT_USER_ID);
    const newNotifications: AppNotification[] = [
      {
        id: nextId('n'),
        type: 'points',
        userId: author.id,
        postId,
        text: `💖 ${voter?.name ?? 'Jemand'} fand Deine Empfehlung zu "${post.title}" hilfreich: +${HELPFUL_POINTS} Punkte!`,
        createdAt: Date.now(),
        read: false,
      },
    ];
    // Neu freigeschaltete Badges melden
    const before = badgesFor(author.points);
    const after = badgesFor(newPoints);
    for (const badge of after.filter(
      (b) => !before.some((eb) => eb.id === b.id)
    )) {
      newNotifications.push({
        id: nextId('n'),
        type: 'badge',
        userId: author.id,
        postId,
        text: `🎉 Neues Badge freigeschaltet: ${badge.emoji} ${badge.name}! Du kannst jetzt Empfehlungen öffentlich posten.`,
        createdAt: Date.now(),
        read: false,
      });
    }
    setNotifications((n) => [...n, ...newNotifications]);
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
  const submitReview = (
    postId: string,
    review: Omit<Review, 'createdAt'>,
    sharePublic: boolean
  ) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const fullReview: Review = { ...review, createdAt: Date.now() };
    setPosts((p) =>
      p.map((item) =>
        item.id === postId
          ? { ...item, review: fullReview, isPublic: sharePublic }
          : item
      )
    );

    if (review.recommended) {
      const group = groups.find((g) => g.id === post.groupId);
      const author = users.find((u) => u.id === post.authorId);
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
  if (route.name === 'newsfeed') {
    screen = (
      <NewsfeedScreen
        posts={posts}
        groups={groups}
        users={users}
        sponsored={seedSponsored}
        unreadCount={unreadCount}
        onOpenDetail={(postId) =>
          setRoute({ name: 'reviewDetail', postId, origin: 'newsfeed' })
        }
        onOpenGroup={(groupId) => setRoute({ name: 'feed', groupId })}
        onOpenNotifications={() => setRoute({ name: 'notifications' })}
        onOpenProfile={() => setRoute({ name: 'profile' })}
      />
    );
  } else if (route.name === 'groups') {
    screen = (
      <GroupsScreen
        groups={groups}
        users={users}
        unreadCount={unreadCount}
        onOpenGroup={(groupId) => setRoute({ name: 'feed', groupId })}
        onOpenNotifications={() => setRoute({ name: 'notifications' })}
        onCreateGroup={createGroup}
      />
    );
  } else if (route.name === 'write') {
    screen = (
      <WriteReviewScreen
        posts={posts}
        groups={groups}
        onOpenReview={(postId) => setRoute({ name: 'review', postId })}
        onSimulateFourWeeks={simulateFourWeeks}
        onShareToGroup={(groupId) => setRoute({ name: 'newPost', groupId })}
      />
    );
  } else if (route.name === 'lists') {
    const ownPosts = posts.filter((p) => p.authorId === CURRENT_USER_ID);
    screen = (
      <ListsScreen
        wishlistCount={wishlist.length}
        testedCount={ownPosts.filter((p) => p.review).length}
        recommendedCount={
          ownPosts.filter((p) => p.review?.recommended).length
        }
        onOpenWishlist={() => setRoute({ name: 'wishlist' })}
        onOpenMyItems={(filter) => setRoute({ name: 'myItems', filter })}
      />
    );
  } else if (route.name === 'myItems') {
    const filter = route.filter;
    const items = posts
      .filter(
        (p) =>
          p.authorId === CURRENT_USER_ID &&
          (filter === 'tested' ? !!p.review : p.review?.recommended)
      )
      .sort(
        (a, b) => (b.review?.createdAt ?? 0) - (a.review?.createdAt ?? 0)
      );
    screen = (
      <MyItemsScreen
        title={
          filter === 'tested'
            ? 'Getestete Sachen ✅'
            : 'Meine Recommendations ✨'
        }
        posts={items}
        users={users}
        onOpenDetail={(postId) =>
          setRoute({ name: 'reviewDetail', postId, origin: filter })
        }
        onBack={() => setRoute({ name: 'lists' })}
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
        users={users}
        onBack={() => setRoute({ name: 'groups' })}
        onNewPost={() => setRoute({ name: 'newPost', groupId: group.id })}
        onOpenReview={(postId) => setRoute({ name: 'review', postId })}
        onOpenDetail={(postId) =>
          setRoute({ name: 'reviewDetail', postId, origin: 'feed' })
        }
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
        canSharePublic={canPostPublic(currentUser.points)}
        onBack={() => setRoute({ name: 'feed', groupId: post.groupId })}
        onSubmit={(review, sharePublic) =>
          submitReview(post.id, review, sharePublic)
        }
      />
    ) : null;
  } else if (route.name === 'reviewDetail') {
    const post = posts.find((p) => p.id === route.postId);
    const origin = route.origin;
    const backRoute: Route =
      origin === 'newsfeed'
        ? { name: 'newsfeed' }
        : origin === 'feed'
        ? { name: 'feed', groupId: post?.groupId ?? '' }
        : { name: 'myItems', filter: origin };
    screen = post ? (
      <ReviewDetailScreen
        post={post}
        author={users.find((u) => u.id === post.authorId)}
        onBack={() => setRoute(backRoute)}
        onMarkHelpful={markHelpful}
        onAddToWishlist={addPostToWishlist}
        isOnWishlist={wishlistTitles.includes(post.title.toLowerCase())}
      />
    ) : null;
  } else if (route.name === 'wishlist') {
    screen = (
      <WishlistScreen
        items={wishlist}
        onBack={() => setRoute({ name: 'lists' })}
        onOpenTikTokImport={() => setRoute({ name: 'tiktokImport' })}
        onOpenShareImport={() => setRoute({ name: 'shareImport' })}
        onRemove={(itemId) =>
          setWishlist((list) => list.filter((w) => w.id !== itemId))
        }
      />
    );
  } else if (route.name === 'tiktokImport') {
    screen = (
      <TikTokImportScreen
        saves={tiktokSaves}
        onBack={() => setRoute({ name: 'wishlist' })}
        onImport={importTikTokSaves}
      />
    );
  } else if (route.name === 'shareImport') {
    screen = (
      <ShareImportScreen
        onBack={() => setRoute({ name: 'wishlist' })}
        onAdd={(item) => {
          addToWishlist({ ...item, source: 'tiktok' });
          setRoute({ name: 'wishlist' });
        }}
      />
    );
  } else if (route.name === 'profile') {
    screen = (
      <ProfileScreen
        user={currentUser}
        aestheticId={aestheticId}
        onChangeAesthetic={setAestheticId}
        onBack={() => setRoute({ name: 'newsfeed' })}
      />
    );
  } else if (route.name === 'notifications') {
    screen = (
      <NotificationsScreen
        notifications={myNotifications}
        onBack={() => {
          markAllRead();
          setRoute({ name: 'newsfeed' });
        }}
      />
    );
  }

  return (
    <ThemeContext.Provider value={themeColors}>
      <SafeAreaView
        style={[styles.safe, { backgroundColor: themeColors.background }]}
      >
        <StatusBar style="dark" />
        <View style={styles.content}>{screen}</View>
        <TabBar
          active={tabForRoute(route)}
          onPress={(key) => setRoute(TAB_ROOTS[key])}
        />
      </SafeAreaView>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1 },
});
