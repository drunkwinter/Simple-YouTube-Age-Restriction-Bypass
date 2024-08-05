import * as core from '@actions/core';

async function run() {
    try {
        core.debug('Hello there!!!')
    } catch (error) {
        // Fail the workflow run if an error occurs
        if (error instanceof Error) core.setFailed(error.message)
    }
}

run();
