import * as core from '@actions/core';

type Image = {
  digest: string;
  architecture: string;
  variant: string;
};

type Tag = {
  name: string;
  digest: string;
  images: Image[];
  id: number;
  repository: number;
  creator: number;
};

const getAllTags = async (url): Promise<Tag[]> => {
  console.log(`Fetching ${url}`);

  const response = await fetch(url);
  const data = await response.json();

  if (data.next) {
    return [...data.results, ...(await getAllTags(data.next))];
  } else {
    return data.results;
  }
};

const checkIfSemver = (tagName: string): boolean => {
  // comes from : https://semver.org
  const semverRegex =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

  return semverRegex.test(tagName);
};

const main = async () => {
  const apiUrl = process.env['INPUT_API-URL'];
  const imageAuthor = process.env['INPUT_IMAGE-AUTHOR'];
  const imageName = process.env['INPUT_IMAGE-NAME'];

  const url = `${apiUrl}/${imageAuthor}/${imageName}/tags`;

  const tags = await getAllTags(url);

  const latestTag = tags.find((tag) => tag.name === 'latest');
  const latestImage = tags.find((tag) => tag.digest === latestTag?.digest && tag.name !== 'latest');
  const allSemVersTags = tags.map((tag) => tag.name).filter((tagName) => checkIfSemver(tagName));
  const allTags = tags.map((tag) => tag.name);

  core.setOutput('latest-version', latestImage?.name);
  core.setOutput('all-versions', allSemVersTags);
  core.setOutput('all-tags', allTags);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
