export type VideoItem = {
  videoId: string;
  title: string;
  channel: string;
  duration: string;
};

export type BookItem = {
  title: string;
  author: string;
  isbn13?: string;
};

export type ArticleItem = {
  title: string;
  source: string;
  url: string;
};
