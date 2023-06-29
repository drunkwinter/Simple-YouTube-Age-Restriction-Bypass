// const cache = new Map();

export function try_unlock_response_with_strategies(ordered_strategies, logger) {
    // const cachedResponse = cache.get(video_id);

    // if (cachedResponse) return createDeepCopy(cachedResponse);

    // const unlockStrategies = getNextUnlockStrategies(video_id);

    for (const strategy of ordered_strategies) {
        const strategy_name = strategy.name;

        if (!strategy.isUsable()) {
            logger.warn(`Strategy "${strategy_name}" is not usable.`, `Reason: ${strategy.unusabilityReason}`);
            continue;
        }

        logger.info(`Trying strategy "${strategy_name}"`);

        try {
            const response = strategy.fetch();

            if (!response) {
                logger.warn(`Strategy "${strategy_name}" failed.`);
                continue;
            }

            // cache.set(video_id, response);
            return response;
        } catch (err) {
            logger.error(`Strategy "${strategy_name}" failed with exception:`, err);
        }
    }

    return null;
}
