import * as core from '@actions/core';

import { getDockerVersions } from './functions';

export const main = async () => {
  try {
    const apiUrl = core.getInput('api-url');
    const imageAuthor = core.getInput('image-author');
    const imageName = core.getInput('image-name');

    const result = await getDockerVersions(apiUrl, imageAuthor, imageName);

    core.setOutput('latest-version', result.latestVersion);
    core.setOutput('all-versions', result.allVersions);
    core.setOutput('all-tags', result.allTags);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
};
