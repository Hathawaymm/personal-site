export interface Permissions {
  /** 可浏览简历文字 */
  resume_text: boolean;
  /** 可浏览个人照片 */
  resume_photo: boolean;
  /** 可浏览作品集 */
  portfolio: boolean;
  /** 可浏览博客 */
  blog: boolean;
  /** 可浏览家庭成员 */
  family: boolean;
  /** 可浏览照片墙 */
  photos: boolean;
}

export const ALL_PERMISSIONS: (keyof Permissions)[] = [
  "resume_text",
  "resume_photo",
  "portfolio",
  "blog",
  "family",
  "photos",
];

export const TEXT_ONLY_PERMISSIONS: (keyof Permissions)[] = [
  "resume_text",
  "blog",
];

export const PERMISSION_LABELS: Record<keyof Permissions, string> = {
  resume_text: "简历文字",
  resume_photo: "个人照片",
  portfolio: "作品集",
  blog: "博客",
  family: "家庭成员",
  photos: "照片墙",
};

export const EMPTY_PERMISSIONS: Permissions = {
  resume_text: false,
  resume_photo: false,
  portfolio: false,
  blog: false,
  family: false,
  photos: false,
};
