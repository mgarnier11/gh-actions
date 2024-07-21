export type Image = {
  digest: string;
  architecture: string;
  variant: string;
};

export type Tag = {
  name: string;
  digest: string;
  images: Image[];
  id: number;
  repository: number;
  creator: number;
};

export type DockerVersions = {
  latestVersion: string;
  allVersions: string[];
  allTags: string[];
};
