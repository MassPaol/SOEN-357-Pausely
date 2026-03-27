import { ImageSourcePropType } from 'react-native';

export type MockPost = {
  id: string;
  username: string;
  avatarColor: string;
  caption: string;
  likes: number;
  comments: number;
  imageUrl?: string;
  localImage?: ImageSourcePropType;
  tags: string[];
};

const USERNAMES = [
  'citycyclistmia',
  'noodlenight.sam',
  'deskplantdani',
  'weekendwithjay',
  'latecheckoutleo',
  'matchalatte.liv',
  'smallroom.bigideas',
  'cloudyskiesnina',
  'trainwindowtom',
  'budgetbites.zoe',
  'sundayswithsora',
  'pixelbypriya',
  'streetframe.eli',
  'roommate.recipes',
  'coffeefirstmiles',
  'notesfromniko',
  'quietluxekim',
  'afterclassaaron',
  'coastlinecami',
  'nightshiftnoah',
  'secondhandselene',
  'busstopbella',
  'livingwithluca',
  'goldenhourgwen',
  'studioaptstories',
  'povwithparker',
  'replaywithria',
  'tinywins.tess',
  'morningswithmax',
  'softlaunchsyd',
];

const CAPTION_OPENERS = [
  'Spent way too long finding the right angle for this, but it was worth it.',
  'A tiny routine upgrade that made today feel less chaotic.',
  'POV: you said you were only opening the app for two minutes.',
  'This is your sign to make the ordinary part of your day look cinematic.',
  'Not everything has to be productive to be meaningful.',
  'I almost did not post this because it felt too simple.',
  'You know that feeling when the whole day suddenly clicks into place?',
  'A low-effort habit that has been carrying me lately.',
  'No gatekeeping, this is genuinely the easiest way I have found.',
  'Caught this on the second try and now I am pretending that was the plan.',
  'The kind of little moment that would have disappeared if I did not film it.',
  'This took five minutes, but I will think about it all week.',
];

const CAPTION_DETAILS = [
  'The comments are probably going to judge me, but I stand by it.',
  'Saving this here so I remember how good this felt.',
  'If you try it, report back because I need to know whether it was luck.',
  'There is something deeply satisfying about getting this exactly right.',
  'I keep coming back to this because it is weirdly calming.',
  'Now I fully understand why people romanticize tiny rituals.',
  'It is not life-changing, just enough to make the day better.',
  'Somehow this became the most replayed part of my week.',
  'It looks effortless in the clip and absolutely was not.',
  'Still deciding whether this counts as self-care or procrastination.',
  'This is the realistic version, not the polished one.',
  'I swear the atmosphere did half the work for me.',
];

const CAPTION_EXTENSIONS = [
  'Also yes, I did go back and watch it three more times.',
  'The background noise is part of the charm.',
  'Now I need everyone else to validate that this is as good as I think it is.',
  'Filed under small comforts with disproportionate impact.',
  'I would defend this choice in a group chat.',
  'Every time I see it, it makes me slow down a bit.',
  'I was supposed to be doing something else, obviously.',
  'The vibe was too specific not to post.',
  'If this reaches the right people, they will understand immediately.',
  'No tutorial needed, just patience and better lighting than I had.',
];

const TAG_POOL = [
  'fyp',
  'foryou',
  'dailyreset',
  'littlemoments',
  'routine',
  'studybreak',
  'weekendvibes',
  'latenightthoughts',
  'cozy',
  'foodtok',
  'roomdecor',
  'commute',
  'studentlife',
  'selfcheck',
  'mindfulmoment',
  'creatorlife',
  'aesthetic',
  'microvlog',
  'dopaminedetox',
  'reallife',
];

const AVATAR_COLORS = [
  '#E76F51',
  '#2A9D8F',
  '#264653',
  '#F4A261',
  '#6D597A',
  '#457B9D',
  '#EF476F',
  '#118AB2',
  '#8D99AE',
  '#BC6C25',
  '#7F5539',
  '#3D405B',
];

const LOCAL_FEED_IMAGES: ImageSourcePropType[] = [
  require('../assets/mock-feed/animal-1.jpg'),
  require('../assets/mock-feed/animal-2.jpg'),
  require('../assets/mock-feed/animal-3.jpg'),
  require('../assets/mock-feed/food-1.jpg'),
  require('../assets/mock-feed/food-2.jpg'),
  require('../assets/mock-feed/food-3.jpg'),
  require('../assets/mock-feed/friends-1.jpg'),
  require('../assets/mock-feed/friends-2.jpg'),
  require('../assets/mock-feed/friends-3.jpg'),
  require('../assets/mock-feed/friends-4.jpg'),
  require('../assets/mock-feed/selfie-1.jpg'),
  require('../assets/mock-feed/selfie-2.jpg'),
  require('../assets/mock-feed/selfie-3.jpg'),
  require('../assets/mock-feed/selfie-4.jpg'),
  require('../assets/mock-feed/travel-1.jpg'),
  require('../assets/mock-feed/travel-2.jpg'),
  require('../assets/mock-feed/travel-3.jpg'),
];

export const mockPosts: MockPost[] = Array.from({ length: 60 }, (_, index) => {
  const caption =
    `${CAPTION_OPENERS[index % CAPTION_OPENERS.length]} ` +
    `${CAPTION_DETAILS[(index * 3) % CAPTION_DETAILS.length]}` +
    (index % 2 === 0
      ? ` ${CAPTION_EXTENSIONS[(index * 5) % CAPTION_EXTENSIONS.length]}`
      : '');

  const likes = 850 + ((index * 1739 + 1200) % 98250);
  const comments = 18 + ((index * 97 + 43) % 6400);
  const tags = [
    TAG_POOL[index % TAG_POOL.length],
    TAG_POOL[(index + 4) % TAG_POOL.length],
    TAG_POOL[(index + 9) % TAG_POOL.length],
  ].filter((tag, tagIndex, array) => array.indexOf(tag) === tagIndex);
  const useLocalImage = index % 4 === 0;

  return {
    id: `post-${index + 1}`,
    username: USERNAMES[index % USERNAMES.length],
    avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
    caption,
    likes,
    comments,
    imageUrl: useLocalImage
      ? undefined
      : `https://picsum.photos/seed/pausely-${index + 1}/720/1280`,
    localImage: useLocalImage
      ? LOCAL_FEED_IMAGES[index % LOCAL_FEED_IMAGES.length]
      : undefined,
    tags,
  };
});

export default mockPosts;
