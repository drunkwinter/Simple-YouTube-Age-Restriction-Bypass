import player_response_observable from "./observables/playerResponse.js";
import { get_ytcfg_value } from "./utils/utils";

export const Player = {
    status: undefined,
    video_id: undefined,
};

player_response_observable.subscribe((response) => {
    Player.status = response.playabilityStatus?.status ?? response.previewPlayabilityStatus?.status;
    Player.video_id = response.videoDetails?.videoId ?? get_ytcfg_value('PLAYER_VARS').video_id;
});
