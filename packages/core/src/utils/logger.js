const BADGE_STYLE = 'line-height: 22px; font-size: 14px; margin-left: 1ch; padding-inline: 1ch; background: #000;';

const SUFFIX = '🐞 You can report bugs at: https://github.com/zerodytrash/Simple-YouTube-Age-Restriction-Bypass/issues';

const INFO = '%c🛈 INFO';
const INFO_STYLE = BADGE_STYLE + 'color: darkgray;';

const WARNING = '%c⚠ WARNING';
const WARNING_STYLE = BADGE_STYLE;

const ERROR = '%c⨯ ERROR';
const ERROR_STYLE = BADGE_STYLE;

const time_formatter = new Intl.DateTimeFormat('default', {
    hourCycle: 'h23',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
});

const NUM_CHARS_START_INDENT = 2;
const NUM_CHARS_TIME = 8;
const MAX_NUM_CHARS_BADGE = WARNING.length - 2 /* %c */ + 2 /* padding */ + 3 /* font-size */;

const FIRSTLINE_INDENT = ' '.repeat(NUM_CHARS_START_INDENT);
const NEXTLINE_INDENT = ' '.repeat(NUM_CHARS_START_INDENT + NUM_CHARS_TIME + 1 /* margin */ + MAX_NUM_CHARS_BADGE + 1 /* whitespace */);
const INFO_MESSAGE_INDENT = ' '.repeat(MAX_NUM_CHARS_BADGE - INFO.length - 2 /* %c */ + 1 /* whitespace */);

export default class Logger {
    constructor(section_name) {
        this.section_name = section_name ? `[${section_name}] ` : '';
    }

    info(message) {
        const prefix_string = time_formatter.format() + INFO;

        console.info(FIRSTLINE_INDENT + prefix_string, INFO_STYLE, INFO_MESSAGE_INDENT + this.section_name + message);

        // TODO: implement dispatchEvent
        // window.dispatchEvent(
        //     new CustomEvent('SYARB_LOG_INFO', {
        //         detail: { message },
        //     }),
        // );
    }

    warn(message, ...optional_messages) {
        for (const optional_message of optional_messages) {
            message += '\n\n' + NEXTLINE_INDENT + optional_message;
        }

        const prefix_string = time_formatter.format() + WARNING;

        console.warn(prefix_string, WARNING_STYLE, this.section_name + message)

        // TODO: implement dispatchEvent
    }

    // TODO: better error output & implement indenting
    error(message, err = '') {
        const prefix_string = time_formatter.format() + ERROR;

        console.error(prefix_string, ERROR_STYLE, this.section_name + message, '\n\n' + err + '\n\n' + SUFFIX);

        // TODO: implement dispatchEvent
        // window.dispatchEvent(
        //     new CustomEvent('SYARB_LOG_ERROR', {
        //         detail: {
        //             message: message + '; ' + (err.message ?? ''),
        //             stack: err.stack,
        //         },
        //     }),
        // );
    }
}
