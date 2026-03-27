import { StatusBar } from 'expo-status-bar';
import { Image as ExpoImage } from 'expo-image';
import { memo, useCallback, useRef, useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useSession } from '../context/sessionStore';
import mockPosts, { MockPost } from '../data/mockPosts';

const INITIAL_LOOP_COUNT = 2;
const RECYCLING_THRESHOLD = 18;
const VIEWABILITY_CONFIG = {
  viewAreaCoveragePercentThreshold: 50,
};
const FALLBACK_BACKDROPS = [
  { base: '#1D3557', accent: '#4EA8DE' },
  { base: '#6B2D5C', accent: '#F4A261' },
  { base: '#2A6F97', accent: '#89C2D9' },
  { base: '#5F0F40', accent: '#FFB703' },
  { base: '#283618', accent: '#DDA15E' },
  { base: '#3A0CA3', accent: '#90E0EF' },
  { base: '#6A040F', accent: '#F48C06' },
  { base: '#14213D', accent: '#E76F51' },
];

const buildFeedChunk = (loop: number): MockPost[] =>
  mockPosts.map((post) => ({
    ...post,
    id: `${post.id}-loop-${loop}`,
  }));

const formatCount = (value: number) => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace('.0', '')}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace('.0', '')}K`;
  }

  return `${value}`;
};

const HeartIcon = memo(function HeartIcon({ size = 30 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Path
        d="M16 27.2c-6.8-4.3-11-8.2-11-13.1 0-3.2 2.3-5.8 5.5-5.8 2 0 3.9 1 5 2.7 1.1-1.7 3-2.7 5-2.7 3.2 0 5.5 2.6 5.5 5.8 0 4.9-4.2 8.8-11 13.1Z"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </Svg>
  );
});

const CommentIcon = memo(function CommentIcon({
  size = 30,
}: {
  size?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Path
        d="M16 6c6.1 0 11 4.1 11 9.2S22.1 24.5 16 24.5c-1.3 0-2.6-.2-3.8-.6l-5 2.5 1.2-4.4C6.9 20.3 5 17.9 5 15.2 5 10.1 9.9 6 16 6Z"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </Svg>
  );
});

const ActionStat = memo(function ActionStat({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <View style={styles.actionStat}>
      <View style={styles.actionButton}>{icon}</View>
      <Text style={styles.actionValue}>{value}</Text>
    </View>
  );
});

const DebugMetricsOverlay = memo(function DebugMetricsOverlay({
  topInset,
  onEndSession,
  sessionEnded,
}: {
  topInset: number;
  onEndSession: () => void;
  sessionEnded: boolean;
}) {
  const postsViewed = useSession((state) => state.postsViewed);
  const scrollCount = useSession((state) => state.scrollCount);

  return (
    <View
      style={[
        styles.debugOverlay,
        {
          top: topInset + 52,
        },
      ]}
    >
      <Text style={styles.debugLabel}>Debug Metrics</Text>
      <Text style={styles.debugValue}>Scrolls: {scrollCount}</Text>
      <Text style={styles.debugValue}>Posts viewed: {postsViewed}</Text>
      <Pressable
        style={[
          styles.debugEndSessionButton,
          sessionEnded ? styles.debugEndSessionButtonDisabled : null,
        ]}
        onPress={onEndSession}
        disabled={sessionEnded}
      >
        <Text style={styles.debugEndSessionButtonText}>
          {sessionEnded ? 'Session Saved' : 'End Session'}
        </Text>
      </Pressable>
    </View>
  );
});

const MediaSurface = memo(function MediaSurface({
  post,
  index,
}: {
  post: MockPost;
  index: number;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const palette = FALLBACK_BACKDROPS[index % FALLBACK_BACKDROPS.length];
  const imageSource = post.localImage ?? post.imageUrl;

  return (
    <View style={[styles.mediaSurface, { backgroundColor: palette.base }]}>
      <View
        style={[
          styles.fallbackShape,
          styles.fallbackShapeLarge,
          {
            backgroundColor: palette.accent,
            top: 44,
            left: -34,
            transform: [{ rotate: '16deg' }],
          },
        ]}
      />
      <View
        style={[
          styles.fallbackShape,
          styles.fallbackShapeSmall,
          {
            backgroundColor: `${palette.accent}99`,
            bottom: 96,
            right: -20,
            transform: [{ rotate: '-12deg' }],
          },
        ]}
      />

      {!imageFailed ? (
        <ExpoImage
          source={imageSource}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          contentPosition="center"
          transition={120}
          onError={() => setImageFailed(true)}
        />
      ) : null}

      <View style={styles.mediaScrim} />

      {imageFailed ? (
        <View style={styles.fallbackCopy}>
          <Text style={styles.fallbackEyebrow}>Suggested clip</Text>
          <Text style={styles.fallbackTitle}>Clip {index + 1}</Text>
          <Text style={styles.fallbackSubtitle}>
            Placeholder media stays visible offline.
          </Text>
        </View>
      ) : null}
    </View>
  );
});

const FeedCard = memo(function FeedCard({
  post,
  index,
  itemWidth,
  itemHeight,
  topInset,
  bottomInset,
}: {
  post: MockPost;
  index: number;
  itemWidth: number;
  itemHeight: number;
  topInset: number;
  bottomInset: number;
}) {
  const [captionExpanded, setCaptionExpanded] = useState(false);

  return (
    <View style={[styles.page, { height: itemHeight }]}>
      <View style={styles.pageContent}>
        <View
          style={[
            styles.mediaFrame,
            {
              width: itemWidth,
              height: itemHeight,
            },
          ]}
        >
          <MediaSurface post={post} index={index} />

          <View
            style={[
              styles.feedChrome,
              {
                top: topInset + 8,
              },
            ]}
          >
            <Text style={styles.chromeMuted}>Following</Text>
            <Text style={styles.chromeActive}>For You</Text>
            <View style={styles.liveDot} />
          </View>

          <View
            style={[
              styles.metaLayer,
              {
                paddingBottom: Math.max(bottomInset, 18),
              },
            ]}
          >
            <View style={styles.metaColumn}>
              <View style={styles.userRow}>
                <View
                  style={[styles.avatar, { backgroundColor: post.avatarColor }]}
                >
                  <Text style={styles.avatarText}>
                    {post.username.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userCopy}>
                  <Text style={styles.username}>@{post.username}</Text>
                </View>
                <Pressable style={styles.followButton}>
                  <Text style={styles.followButtonText}>Follow</Text>
                </Pressable>
              </View>

              <Pressable
                onPress={() => setCaptionExpanded((current) => !current)}
              >
                <Text
                  style={[
                    styles.caption,
                    captionExpanded ? styles.captionExpanded : null,
                  ]}
                  numberOfLines={captionExpanded ? undefined : 1}
                  ellipsizeMode="tail"
                >
                  {post.caption}
                </Text>
              </Pressable>

              <Text style={styles.tagsLine} numberOfLines={1}>
                {post.tags.map((tag) => `#${tag}`).join('   ')}
              </Text>
            </View>

            <View style={styles.actionsRail}>
              <ActionStat
                icon={<HeartIcon />}
                value={formatCount(post.likes)}
              />
              <ActionStat
                icon={<CommentIcon />}
                value={formatCount(post.comments)}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
});

export default function FeedScreen() {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const itemHeight = height;
  const itemWidth = width;

  const incrementPostsViewed = useSession(
    (state) => state.incrementPostsViewed,
  );
  const incrementScrollCount = useSession(
    (state) => state.incrementScrollCount,
  );
  const endSession = useSession((state) => state.endSession);
  const actualEndTime = useSession((state) => state.actualEndTime);

  const loopRef = useRef(INITIAL_LOOP_COUNT);
  const seenPostIdsRef = useRef(new Set<string>());
  const isExtendingRef = useRef(false);
  const [feedPosts, setFeedPosts] = useState<MockPost[]>(() =>
    Array.from({ length: INITIAL_LOOP_COUNT }, (_, loopIndex) =>
      buildFeedChunk(loopIndex),
    ).flat(),
  );
  const feedLengthRef = useRef(feedPosts.length);
  feedLengthRef.current = feedPosts.length;

  const extendFeed = useCallback(() => {
    if (isExtendingRef.current) {
      return;
    }

    isExtendingRef.current = true;
    const nextLoop = loopRef.current;
    loopRef.current += 1;
    setFeedPosts((currentPosts) => [
      ...currentPosts,
      ...buildFeedChunk(nextLoop),
    ]);

    requestAnimationFrame(() => {
      isExtendingRef.current = false;
    });
  }, []);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<MockPost>) => (
      <FeedCard
        post={item}
        index={index}
        itemWidth={itemWidth}
        itemHeight={itemHeight}
        topInset={insets.top}
        bottomInset={insets.bottom}
      />
    ),
    [insets.bottom, insets.top, itemHeight, itemWidth],
  );

  const handleScrollBeginDrag = useCallback(() => {
    incrementScrollCount();
  }, [incrementScrollCount]);

  const handleDebugEndSession = useCallback(() => {
    if (actualEndTime === null) {
      endSession();
    }
  }, [actualEndTime, endSession]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const activeItem = viewableItems
        .filter((entry) => entry.isViewable && typeof entry.index === 'number')
        .sort((left, right) => (left.index ?? 0) - (right.index ?? 0))[0];

      if (!activeItem?.item) {
        return;
      }

      const activePost = activeItem.item as MockPost;

      if (!seenPostIdsRef.current.has(activePost.id)) {
        seenPostIdsRef.current.add(activePost.id);
        incrementPostsViewed();
      }

      if (
        (activeItem.index ?? 0) >=
        feedLengthRef.current - RECYCLING_THRESHOLD
      ) {
        extendFeed();
      }
    },
  ).current;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <FlatList
        data={feedPosts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        bounces={false}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        overScrollMode="never"
        initialNumToRender={3}
        maxToRenderPerBatch={4}
        windowSize={5}
        onScrollBeginDrag={handleScrollBeginDrag}
        onEndReached={extendFeed}
        onEndReachedThreshold={0.7}
        viewabilityConfig={VIEWABILITY_CONFIG}
        onViewableItemsChanged={onViewableItemsChanged}
        getItemLayout={(_, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
      />
      {__DEV__ ? (
        <DebugMetricsOverlay
          topInset={insets.top}
          onEndSession={handleDebugEndSession}
          sessionEnded={actualEndTime !== null}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  page: {
    backgroundColor: '#050505',
  },
  pageContent: {
    flex: 1,
    paddingHorizontal: 0,
  },
  feedChrome: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chromeMuted: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 16,
  },
  chromeActive: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#F4A261',
    marginLeft: 10,
  },
  mediaFrame: {
    flex: 1,
    alignSelf: 'center',
    backgroundColor: '#101010',
    justifyContent: 'flex-end',
  },
  mediaSurface: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  mediaScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.24)',
  },
  fallbackShape: {
    position: 'absolute',
    borderRadius: 28,
  },
  fallbackShapeLarge: {
    width: 240,
    height: 240,
  },
  fallbackShapeSmall: {
    width: 180,
    height: 180,
  },
  fallbackCopy: {
    position: 'absolute',
    top: 84,
    left: 20,
    right: 20,
  },
  fallbackEyebrow: {
    color: 'rgba(255,255,255,0.74)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  fallbackTitle: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 6,
  },
  fallbackSubtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 220,
  },
  metaLayer: {
    paddingHorizontal: 18,
    paddingTop: 140,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  metaColumn: {
    flex: 1,
    paddingRight: 14,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.86)',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  userCopy: {
    flexShrink: 1,
    flex: 1,
  },
  username: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  followButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  caption: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 12,
    paddingRight: 4,
  },
  captionExpanded: {
    lineHeight: 22,
  },
  tagsLine: {
    color: '#F6BD60',
    fontSize: 13,
    fontWeight: '700',
  },
  actionsRail: {
    width: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -10,
    paddingBottom: 200,
  },
  actionStat: {
    alignItems: 'center',
    marginTop: 8,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  debugOverlay: {
    position: 'absolute',
    right: 12,
    zIndex: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(5, 5, 5, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  debugLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  debugValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  debugEndSessionButton: {
    marginTop: 10,
    borderRadius: 999,
    backgroundColor: '#F4A261',
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  debugEndSessionButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  debugEndSessionButtonText: {
    color: '#111111',
    fontSize: 12,
    fontWeight: '800',
  },
});
