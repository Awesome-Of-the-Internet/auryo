import { denormalize, schema } from 'normalizr';
import { createSelector } from 'reselect';
import { EntitiesState } from '.';
import { StoreState } from '..';
import { NormalizedResult, SoundCloud } from '../../../types';
import { playlistSchema, trackSchema, userSchema, commentSchema } from '../../schemas';

export const getEntities = (state: StoreState) => state.entities;

export const normalizeSchema = new schema.Array({
    tracks: trackSchema,
    playlists: playlistSchema,
    users: userSchema,
    comments: commentSchema
}, (input) => `${input.kind}s`);

export const getDenormalizedEntities = <T>(result: Array<NormalizedResult>) => createSelector<StoreState, EntitiesState, Array<T>>(
    getEntities,
    (entities) => denormalize(result, normalizeSchema, entities)
);

export const getDenormalizedEntity = <T>(result: NormalizedResult) => createSelector<StoreState, Array<T>, T | null>(
    getDenormalizedEntities([result]),
    (entities) => entities[0]
);

export const getMusicEntity = (result: NormalizedResult) => getDenormalizedEntity<SoundCloud.Music | null>(result);
export const getUserEntity = (id: number) => getDenormalizedEntity<SoundCloud.User | null>({ id, schema: 'users' });
export const getTrackEntity = (id: number) => getDenormalizedEntity<SoundCloud.Track | null>({ id, schema: 'tracks' });
export const getPlaylistEntity = (id: number) => getDenormalizedEntity<SoundCloud.Playlist | null>({ id, schema: 'playlists' });
export const getCommentEntity = (id: number) => getDenormalizedEntity<SoundCloud.Comment | null>({ id, schema: 'comments' });
