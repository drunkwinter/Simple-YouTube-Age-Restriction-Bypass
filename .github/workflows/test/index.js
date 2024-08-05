const core = require('@actions/core');

try {
    console.log(`Hello ALLL!`);
} catch (error) {
    core.setFailed(error.message);
}
