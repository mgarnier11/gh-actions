import { compareVersions } from 'compare-versions';

import * as core from '@actions/core';

import { DockerVersions, Tag } from './types';

export const getAllTags = async (url: string): Promise<Tag[]> => {
  core.info(`Fetching tags from ${url}`);

  const response = await fetch(url);
  const data = await response.json();

  if (data?.next) {
    return [...data.results, ...(await getAllTags(data.next))];
  } else {
    return data?.results ?? [];
  }
};

export const checkIfSemver = (tagName: string): boolean => {
  // comes from : https://semver.org
  const semverRegex =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

  return semverRegex.test(tagName);
};

export const getDockerVersions = async (
  apiUrl: string,
  imageAuthor: string,
  imageName: string
): Promise<DockerVersions> => {
  const url = `${apiUrl}/${imageAuthor}/${imageName}/tags`;

  const tags = await getAllTags(url);

  core.debug(`tags: ${JSON.stringify(tags)}`);

  const latestTag = tags.find((tag) => tag.name === 'latest');

  const allSemVersTags = tags.filter((tag) => checkIfSemver(tag.name)).sort((a, b) => compareVersions(b.name, a.name));
  const latestImage =
    tags.find((tag) => tag.digest === latestTag?.digest && tag.name !== 'latest') ?? allSemVersTags[0];

  return {
    latestVersion: latestImage?.name ?? '',
    allVersions: allSemVersTags.map((tag) => tag.name),
    allTags: tags.map((tag) => tag.name),
  };
};
