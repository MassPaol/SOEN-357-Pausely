import { StatusBar } from 'expo-status-bar';
import { Image as ExpoImage } from 'expo-image';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  useWindowDimensions,
  View,
  ViewToken,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';
import { useSession } from '../context/sessionStore';
import mockPosts, { MockPost } from '../data/mockPosts';
import useSessionTimer from '../hooks/useSessionTimer';
import SessionPromptOverlay, {
  type VisibleModal,
} from '../components/SessionPromptOverlay';
import type { RootStackParamList } from '../navigation/AppNavigator';

const INITIAL_LOOP_COUNT = 2;
const RECYCLING_THRESHOLD = 18;
const DOUBLE_TAP_DELAY_MS = 280;
const PROFILE_FEEDBACK_DURATION_MS = 900;
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

const HeartIcon = memo(function HeartIcon({
  size = 30,
  filled = false,
}: {
  size?: number;
  filled?: boolean;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Path
        d="M16 27.2c-6.8-4.3-11-8.2-11-13.1 0-3.2 2.3-5.8 5.5-5.8 2 0 3.9 1 5 2.7 1.1-1.7 3-2.7 5-2.7 3.2 0 5.5 2.6 5.5 5.8 0 4.9-4.2 8.8-11 13.1Z"
        fill={filled ? '#FF4D6D' : 'none'}
        stroke={filled ? '#FF4D6D' : '#FFFFFF'}
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
  onPress,
  animatedStyle,
  valueStyle,
}: {
  icon: React.ReactNode;
  value: string;
  onPress?: () => void;
  animatedStyle?: Animated.WithAnimatedValue<StyleProp<ViewStyle>>;
  valueStyle?: StyleProp<TextStyle>;
}) {
  const content = (
    <Animated.View style={[styles.actionStat, animatedStyle]}>
      <View style={styles.actionButton}>{icon}</View>
      <Text style={[styles.actionValue, valueStyle]}>{value}</Text>
    </Animated.View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
});

// const HARD_CAP_MS = 600_000;
const HARD_CAP_MS = 60_000;
function formatTimer(ms: number) {
  const totalSeconds = Math.max(Math.ceil(ms / 1000), 0);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const DebugMetricsOverlay = memo(function DebugMetricsOverlay({
  topInset,
}: {
  topInset: number;
}) {
  const postsViewed = useSession((state) => state.postsViewed);
  const scrollCount = useSession((state) => state.scrollCount);
  const group = useSession((s) => s.group);
  const sessionStartTime = useSession((s) => s.sessionStartTime);
  const intendedDuration = useSession((s) => s.intendedDuration);
  const actualEndTime = useSession((s) => s.actualEndTime);
  const pauseStartedAt = useSession((s) => s.pauseStartedAt);
  const totalPausedMs = useSession((s) => s.totalPausedMs);

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!sessionStartTime || actualEndTime !== null) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [sessionStartTime, actualEndTime]);

  const activePauseMs = pauseStartedAt ? now - pauseStartedAt : 0;
  const elapsed = sessionStartTime
    ? now - sessionStartTime - totalPausedMs - activePauseMs
    : 0;
  const sessionLimitMs =
    group === 'control' ? HARD_CAP_MS : (intendedDuration ?? 0);
  const midLeft = sessionLimitMs / 2 - elapsed;
  const endLeft = sessionLimitMs - elapsed;
  const hardCapLeft = HARD_CAP_MS - elapsed;
  const isExperimental = group === 'experimental';

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
      <Text style={styles.debugValue}>Group: {group ?? 'none'}</Text>
      <Text style={styles.debugValue}>Scrolls: {scrollCount}</Text>
      <Text style={styles.debugValue}>Posts viewed: {postsViewed}</Text>

      {sessionStartTime && actualEndTime === null ? (
        <>
          <View style={styles.debugDivider} />
          <Text style={styles.debugLabel}>Session</Text>
          <Text style={styles.debugValue}>Elapsed: {formatTimer(elapsed)}</Text>
          <Text
            style={[
              styles.debugTimerMain,
              endLeft <= 60_000 && endLeft > 0 && styles.debugValueWarn,
            ]}
          >
            Remaining: {endLeft <= 0 ? '0:00' : formatTimer(endLeft)}
          </Text>
        </>
      ) : null}

      {isExperimental && sessionStartTime && actualEndTime === null ? (
        <>
          <View style={styles.debugDivider} />
          <Text style={styles.debugLabel}>Prompt Timers</Text>
          <Text
            style={[styles.debugValue, midLeft <= 0 && styles.debugValueFired]}
          >
            Mid: {midLeft <= 0 ? 'FIRED' : formatTimer(midLeft)}
          </Text>
          <Text
            style={[styles.debugValue, endLeft <= 0 && styles.debugValueFired]}
          >
            End: {endLeft <= 0 ? 'FIRED' : formatTimer(endLeft)}
          </Text>
          <Text
            style={[
              styles.debugValue,
              hardCapLeft <= 60_000 && hardCapLeft > 0 && styles.debugValueWarn,
              hardCapLeft <= 0 && styles.debugValueFired,
            ]}
          >
            Hard cap: {hardCapLeft <= 0 ? 'FIRED' : formatTimer(hardCapLeft)}
          </Text>
        </>
      ) : null}
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
  onStopSession,
}: {
  post: MockPost;
  index: number;
  itemWidth: number;
  itemHeight: number;
  topInset: number;
  bottomInset: number;
  onStopSession: () => void;
}) {
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [showProfileFeedback, setShowProfileFeedback] = useState(false);
  const likeScale = useRef(new Animated.Value(1)).current;
  const likeBurstScale = useRef(new Animated.Value(0.3)).current;
  const likeBurstOpacity = useRef(new Animated.Value(0)).current;
  const profileToastOpacity = useRef(new Animated.Value(0)).current;
  const profileToastTranslateY = useRef(new Animated.Value(8)).current;
  const profileScale = useRef(new Animated.Value(1)).current;
  const lastTapTimestampRef = useRef(0);
  const profileFeedbackTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const displayLikes = post.likes + (liked ? 1 : 0);

  useEffect(() => {
    return () => {
      if (profileFeedbackTimeoutRef.current) {
        clearTimeout(profileFeedbackTimeoutRef.current);
      }
    };
  }, []);

  const triggerLikeAnimation = useCallback(
    (showBurst: boolean) => {
      likeScale.setValue(0.84);
      Animated.spring(likeScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 22,
        bounciness: 11,
      }).start();

      if (!showBurst) {
        return;
      }

      likeBurstScale.setValue(0.3);
      likeBurstOpacity.setValue(0.92);
      Animated.parallel([
        Animated.spring(likeBurstScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 18,
          bounciness: 10,
        }),
        Animated.timing(likeBurstOpacity, {
          toValue: 0,
          duration: 420,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [likeBurstOpacity, likeBurstScale, likeScale],
  );

  const handleLikeToggle = useCallback(() => {
    setLiked((current) => {
      const next = !current;

      if (next) {
        triggerLikeAnimation(false);
      }

      return next;
    });
  }, [triggerLikeAnimation]);

  const handlePostTap = useCallback(() => {
    const now = Date.now();

    if (now - lastTapTimestampRef.current <= DOUBLE_TAP_DELAY_MS) {
      lastTapTimestampRef.current = 0;

      setLiked((current) => {
        if (!current) {
          triggerLikeAnimation(true);
          return true;
        }

        triggerLikeAnimation(true);
        return current;
      });

      return;
    }

    lastTapTimestampRef.current = now;
  }, [triggerLikeAnimation]);

  const handleProfilePress = useCallback(() => {
    if (profileFeedbackTimeoutRef.current) {
      clearTimeout(profileFeedbackTimeoutRef.current);
    }

    setShowProfileFeedback(true);
    profileScale.setValue(0.96);
    profileToastOpacity.setValue(0);
    profileToastTranslateY.setValue(8);

    Animated.parallel([
      Animated.sequence([
        Animated.spring(profileScale, {
          toValue: 1.04,
          useNativeDriver: true,
          speed: 20,
          bounciness: 10,
        }),
        Animated.spring(profileScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 8,
        }),
      ]),
      Animated.parallel([
        Animated.timing(profileToastOpacity, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(profileToastTranslateY, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    profileFeedbackTimeoutRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(profileToastOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(profileToastTranslateY, {
          toValue: 8,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowProfileFeedback(false);
      });
    }, PROFILE_FEEDBACK_DURATION_MS);
  }, [profileScale, profileToastOpacity, profileToastTranslateY]);

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
          <Pressable style={styles.mediaTapTarget} onPress={handlePostTap}>
            <MediaSurface post={post} index={index} />
            <Animated.View
              pointerEvents="none"
              style={[
                styles.likeBurst,
                {
                  opacity: likeBurstOpacity,
                  transform: [{ scale: likeBurstScale }],
                },
              ]}
            >
              <HeartIcon size={96} filled />
            </Animated.View>
          </Pressable>

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
            <Pressable style={styles.stopButton} onPress={onStopSession}>
              <Text style={styles.stopButtonText}>Stop</Text>
            </Pressable>
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
              {showProfileFeedback ? (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.profileToast,
                    {
                      opacity: profileToastOpacity,
                      transform: [{ translateY: profileToastTranslateY }],
                    },
                  ]}
                >
                  <Text style={styles.profileToastText}>
                    Previewing @{post.username}
                  </Text>
                </Animated.View>
              ) : null}

              <View style={styles.userRow}>
                <Pressable onPress={handleProfilePress}>
                  <Animated.View
                    style={[
                      styles.userIdentityGroup,
                      {
                        transform: [{ scale: profileScale }],
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.avatar,
                        { backgroundColor: post.avatarColor },
                      ]}
                    >
                      <Text style={styles.avatarText}>
                        {post.username.slice(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.userCopy}>
                      <Text style={styles.username}>@{post.username}</Text>
                    </View>
                  </Animated.View>
                </Pressable>
                <Pressable
                  style={[
                    styles.followButton,
                    following ? styles.followButtonActive : null,
                  ]}
                  onPress={() => setFollowing((current) => !current)}
                >
                  <Text
                    style={[
                      styles.followButtonText,
                      following ? styles.followButtonTextActive : null,
                    ]}
                  >
                    {following ? 'Following' : 'Follow'}
                  </Text>
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
                icon={<HeartIcon filled={liked} />}
                value={formatCount(displayLikes)}
                onPress={handleLikeToggle}
                animatedStyle={{ transform: [{ scale: likeScale }] }}
                valueStyle={liked ? styles.actionValueLiked : null}
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

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const incrementPostsViewed = useSession(
    (state) => state.incrementPostsViewed,
  );
  const incrementScrollCount = useSession(
    (state) => state.incrementScrollCount,
  );
  const group = useSession((state) => state.group);
  const endSession = useSession((state) => state.endSession);
  const intendedDuration = useSession((state) => state.intendedDuration);
  const pauseSession = useSession((state) => state.pauseSession);
  const resumeSession = useSession((state) => state.resumeSession);
  const setMidPromptShownAt = useSession((state) => state.setMidPromptShownAt);
  const recordPromptDecision = useSession(
    (state) => state.recordPromptDecision,
  );

  const [visibleModal, setVisibleModal] = useState<VisibleModal>(null);
  const promptQueueRef = useRef<('mid' | 'endSession')[]>([]);
  const visibleModalRef = useRef(visibleModal);
  visibleModalRef.current = visibleModal;

  useEffect(() => {
    if (visibleModal !== null) {
      pauseSession();
      return;
    }

    resumeSession();
  }, [pauseSession, resumeSession, visibleModal]);

  const showModal = useCallback(
    (modal: 'mid' | 'endSession' | 'exit') => {
      if (modal === 'mid') {
        setMidPromptShownAt(Date.now());
      }
      setVisibleModal(modal);
    },
    [setMidPromptShownAt],
  );

  const showOrQueue = useCallback(
    (modal: 'mid' | 'endSession') => {
      if (__DEV__)
        console.log(
          '[FeedScreen] showOrQueue:',
          modal,
          'current:',
          visibleModalRef.current,
        );
      if (visibleModalRef.current === null) {
        showModal(modal);
      } else {
        promptQueueRef.current.push(modal);
      }
    },
    [showModal],
  );

  const drainQueue = useCallback(() => {
    const next = promptQueueRef.current.shift();
    if (next) {
      showModal(next);
      return;
    }
    setVisibleModal(null);
  }, [showModal]);

  const onMidSession = useCallback(() => showOrQueue('mid'), [showOrQueue]);
  const onEndSession = useCallback(
    () => showOrQueue('endSession'),
    [showOrQueue],
  );
  const onHardCap = useCallback(() => {
    promptQueueRef.current = [];
    setVisibleModal(null);
    const { actualEndTime: aet } = useSession.getState();
    if (aet === null) endSession();
    navigation.reset({ index: 0, routes: [{ name: 'Questionnaire' }] });
  }, [endSession, navigation]);

  useSessionTimer({
    intendedDuration,
    onMidSession,
    onEndSession,
    onHardCap,
  });

  const handleMidContinue = useCallback(() => {
    recordPromptDecision('mid', 'continue');
    drainQueue();
  }, [recordPromptDecision, drainQueue]);

  const handleMidExit = useCallback(() => {
    recordPromptDecision('mid', 'exit');
    promptQueueRef.current = [];
    showModal('exit');
  }, [recordPromptDecision, showModal]);

  const handleEndContinue = useCallback(() => {
    recordPromptDecision('endSession', 'continue');
    drainQueue();
  }, [recordPromptDecision, drainQueue]);

  const handleEndExit = useCallback(() => {
    recordPromptDecision('endSession', 'exit');
    promptQueueRef.current = [];
    const { actualEndTime: aet, pauseStartedAt: pausedAt } =
      useSession.getState();
    if (aet === null) {
      endSession(pausedAt ?? undefined);
    }
    setVisibleModal(null);
    navigation.reset({ index: 0, routes: [{ name: 'Questionnaire' }] });
  }, [recordPromptDecision, endSession, navigation]);

  const handleExitContinue = useCallback(() => {
    recordPromptDecision('exit', 'continue');
    setVisibleModal(null);
  }, [recordPromptDecision]);

  const handleExitEnd = useCallback(() => {
    recordPromptDecision('exit', 'exit');
    const { actualEndTime: aet, pauseStartedAt: pausedAt } =
      useSession.getState();
    if (aet === null) {
      endSession(pausedAt ?? undefined);
    }
    setVisibleModal(null);
    navigation.reset({ index: 0, routes: [{ name: 'Questionnaire' }] });
  }, [recordPromptDecision, endSession, navigation]);

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

  const handleStopSession = useCallback(() => {
    promptQueueRef.current = [];

    if (group === 'control') {
      const { actualEndTime: aet } = useSession.getState();
      if (aet === null) {
        endSession();
      }
      navigation.reset({ index: 0, routes: [{ name: 'Questionnaire' }] });
      return;
    }

    pauseSession();
    showModal('exit');
  }, [endSession, group, navigation, pauseSession, showModal]);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<MockPost>) => (
      <FeedCard
        post={item}
        index={index}
        itemWidth={itemWidth}
        itemHeight={itemHeight}
        topInset={insets.top}
        bottomInset={insets.bottom}
        onStopSession={handleStopSession}
      />
    ),
    [handleStopSession, insets.bottom, insets.top, itemHeight, itemWidth],
  );

  const handleScrollBeginDrag = useCallback(() => {
    incrementScrollCount();
  }, [incrementScrollCount]);

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
      {__DEV__ ? <DebugMetricsOverlay topInset={insets.top} /> : null}
      <SessionPromptOverlay
        visibleModal={visibleModal}
        onMidContinue={handleMidContinue}
        onMidExit={handleMidExit}
        onEndContinue={handleEndContinue}
        onEndExit={handleEndExit}
        onExitContinue={handleExitContinue}
        onExitEnd={handleExitEnd}
      />
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
  stopButton: {
    position: 'absolute',
    right: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
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
  mediaTapTarget: {
    ...StyleSheet.absoluteFillObject,
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
  profileToast: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(9,9,9,0.74)',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  profileToastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  userIdentityGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
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
  followButtonActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  followButtonTextActive: {
    color: '#111111',
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
  actionValueLiked: {
    color: '#FFCCD5',
  },
  likeBurst: {
    position: 'absolute',
    top: '42%',
    left: '50%',
    marginLeft: -48,
    marginTop: -48,
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
  debugTimerMain: {
    color: '#F4A261',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
    fontVariant: ['tabular-nums'],
  },
  debugDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignSelf: 'stretch',
    marginVertical: 6,
  },
  debugValueFired: {
    color: 'rgba(255,255,255,0.35)',
    textDecorationLine: 'line-through',
  },
  debugValueWarn: {
    color: '#FF6B6B',
  },
});
