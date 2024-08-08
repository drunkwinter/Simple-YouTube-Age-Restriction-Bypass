import { readFileSync } from 'fs';
import * as core from '@actions/core'

async function run() {
    try {
        const greasyfork_user_email = core.getInput('GREASYFORK_USER_EMAIL');
        const greasyfork_user_pass = core.getInput('GREASYFORK_USER_PASS');
        const greasyfork_script_id = core.getInput('GREASYFORK_SCRIPT_ID');
        const greasyfork_script_type = (() => {
            switch (core.getInput('GREASYFORK_SCRIPT_TYPE')) {
                case 'public': return '1';
                case 'unlisted': return '2';
                case 'library': return '3';
            }
            return '1';
        })();

        core.debug(greasyfork_user_email + ' - ' +
                    greasyfork_user_pass + ' - ' +
                    greasyfork_script_id + ' - ' +
                    greasyfork_script_type);

        const file_path_to_upload = core.getInput('SCRIPT_FILE_PATH');

        await publish_to_greasyfork(greasyfork_user_email, greasyfork_user_pass, greasyfork_script_id, greasyfork_script_type, file_path_to_upload);
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
    }
}

function extract_authenticity_token(text: string): string | null {
    const match = text.match(/name="csrf-token" content="([^"]+)"/);
    return match ? match[1] : null;
}

async function publish_to_greasyfork(user_email: string, user_pass: string, script_id: string, script_type: string, file_path_to_upload: string) {
    const BASE_URL = 'https://greasyfork.org';

    // "/en/search" appears to be the lightest page
    const INITIAL_PAGE_PATH = '/en/search';

    const initial_url= `${BASE_URL}${INITIAL_PAGE_PATH}`;

    // Get initial page to retrieve the initial auth token
    const initial_response = await fetch(initial_url, { method: 'GET' });

    let cookie = initial_response.headers.getSetCookie().join('; ');

    const initial_response_body = await initial_response.text();

    let authenticity_token = extract_authenticity_token(initial_response_body);

    if (!authenticity_token) {
        throw new Error('Could not retrieve initial authentication token');
    }

    const login_body = new URLSearchParams({
        'authenticity_token': authenticity_token,
        'user[email]': user_email,
        'user[password]': user_pass,
        'user[remember_me]': '0',
        'commit': 'Log in',
    });

    const login_url= `${BASE_URL}/en/users/sign_in?return_to=${INITIAL_PAGE_PATH}`;

    // Log in to retrieve the final login auth token
    const login_response = await fetch(login_url, {
        method: 'POST',
        headers: { 'Cookie': cookie },
        body: login_body,
    });

    cookie = initial_response.headers.getSetCookie().join('; ');

    const login_response_body = await login_response.text();

    // Check if login was successful
    if (!login_response_body.includes('sign-out-link')) {
        console.log('\x1b[38;2;103;103;103m%s\x1b[0m\n', login_response);
        console.log('\x1b[1;31mFailed: Sign in\x1b[0m - Unknown reason');
        process.exitCode = 1;
        return;
    }

    // Extract updated authenticity token after successful login
    authenticity_token = extract_authenticity_token(login_response_body);

    if (!authenticity_token) {
        throw new Error('Could not retrieve login authentication token');
    }

    const script_file_blob = new Blob([readFileSync(file_path_to_upload)]);

    const update_body = new FormData();
    update_body.set('authenticity_token', authenticity_token);
    update_body.set('script_version[code]', '');
    update_body.set('code_upload', script_file_blob);
    update_body.set('script_version[additional_info][0][attribute_default]', 'true');
    update_body.set('script_version[additional_info][0][value_markup]', 'html');
    update_body.set('script_version[additional_info][0][attribute_value]', '');
    update_body.set('script_version[attachments][]', '');
    update_body.set('script_version[changelog_markup]', 'html');
    update_body.set('script_version[changelog]', '');
    update_body.set('script[script_type]', script_type);
    update_body.set('script[adult_content_self_report]', '0');
    update_body.set('commit', 'Post new version');

    const update_url= `${BASE_URL}/en/scripts/${script_id}/versions`;

    // Update the script
    const update_response = await fetch(update_url, {
        method: 'POST',
        headers: { 'Cookie': cookie },
        body: update_body,
    });

    const update_response_body = await update_response.text();

    // Check if the script update was successful
    if (!update_response_body.includes('id="install-area"')) {
        console.log('\x1b[38;2;103;103;103m%s\x1b[0m\n', update_response_body);
        if (update_response_body.includes('validation-errors')) {
            console.log('\x1b[1;31mFailed: Publish to GreasyFork\x1b[0m - Validation errors were reported');
        } else {
            console.log('\x1b[1;31mFailed: Publish to GreasyFork\x1b[0m - Unknown reason');
        }

        process.exitCode = 1;
        return;
    }
}

run();
