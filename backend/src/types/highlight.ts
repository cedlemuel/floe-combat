export type HighlightMedia = {
  id: number;
  highlight_id: number;
  media_type: "video" | "image";
  media_url: string;
  media_public_id: string;
  thumbnail_url: string | null;
  thumbnail_public_id: string | null;
  sort_order: number;
  created_at: Date;
};

export type Highlight = {
  id: number;
  title: string;
  athlete: string;
  created_at: Date;
  updated_at: Date;
  media: HighlightMedia[];
};
