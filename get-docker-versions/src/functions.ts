import { DockerVersions, Tag } from './types';

const getAllTags = async (url: string): Promise<Tag[]> => {
  console.log(`Fetching ${url}`);

  const response = await fetch(url);
  const data = await response.json();

  if (data?.next) {
    return [...data.results, ...(await getAllTags(data.next))];
  } else {
    return data?.results ?? [];
  }
};

const checkIfSemver = (tagName: string): boolean => {
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

  console.log(tags);

  const latestTag = tags.find((tag) => tag.name === 'latest');
  const latestImage = tags.find((tag) => tag.digest === latestTag?.digest && tag.name !== 'latest');
  const allSemVersTags = tags.map((tag) => tag.name).filter((tagName) => checkIfSemver(tagName));
  const allTags = tags.map((tag) => tag.name);

  return {
    latestVersion: latestImage?.name ?? '',
    allVersions: allSemVersTags,
    allTags: allTags,
  };
};

export const exportFunctions = {
  getAllTags,
  checkIfSemver,
};
