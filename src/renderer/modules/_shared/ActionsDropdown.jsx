import { Position } from '@blueprintjs/core';
import { Menu } from '@blueprintjs/core/lib/cjs/components/menu/menu';
import { MenuDivider } from '@blueprintjs/core/lib/cjs/components/menu/menuDivider';
import { MenuItem } from '@blueprintjs/core/lib/cjs/components/menu/menuItem';
import { Popover } from '@blueprintjs/core/lib/cjs/components/popover/popover';
import cn from 'classnames';
import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import * as actions from '../../../shared/actions';
import { OBJECT_TYPES } from '../../../shared/constants';
import { SC } from '../../../shared/utils';
import ShareMenuItem from './ShareMenuItem';

class ActionsDropdown extends React.Component {

    shouldComponentUpdate(nextProps) {
        const { track, liked, index, reposted, playlists } = this.props;

        return track.id !== nextProps.track.id ||
            liked !== nextProps.liked ||
            index !== nextProps.index ||
            reposted !== nextProps.reposted ||
            !isEqual(playlists, nextProps.playlists)
    }

    onClick = (e) => {
        e.stopPropagation()
        e.nativeEvent.stopImmediatePropagation()
    }

    render() {
        const { toggleLike, toggleRepost, reposted, liked, track, addUpNext, index, playlists, togglePlaylistTrack, playlist_objects } = this.props

        const trackId = track.id

        return (
            <Popover className="actions-dropdown" autoFocus={false} minimal content={(
                <Menu>
                    <MenuItem className={cn({ 'text-primary': liked })} text={liked ? 'Liked' : 'Like'}
                        onClick={(e) => {
                            this.onClick(e)
                            toggleLike(trackId, track.kind === 'playlist')
                        }} />
                    <MenuItem className={cn({ 'text-primary': reposted })} text={reposted ? 'Reposted' : 'Repost'}
                        onClick={(e) => {
                            this.onClick(e)
                            toggleRepost(trackId)
                        }} />

                    <MenuItem text="Add to queue" onClick={(e) => {
                        this.onClick(e)
                        addUpNext(trackId, track.kind === 'playlist' ? track : null)
                    }} />

                    {
                        track.kind !== 'playlist' ? (
                            <MenuItem text="Add to playlist">
                                {
                                    playlists.map(playlist => {

                                        const items = playlist_objects[playlist.id].items || []

                                        const inPlaylist = items.indexOf(trackId) !== -1

                                        return (
                                            <MenuItem
                                                key={`menu-item-add-to-playlist-${playlist.id}`}
                                                className={cn({ 'text-primary': inPlaylist })}
                                                onClick={togglePlaylistTrack.bind(null, trackId, playlist.id)}
                                                text={playlist.title} />
                                        )
                                    })
                                }
                            </MenuItem>
                        ) : null
                    }


                    {
                        index !== null ? (
                            <MenuItem text="Remove from queue" onClick={(e) => {
                                this.onClick(e)
                                addUpNext(trackId, track.kind === 'playlist' ? track : null, index)
                            }} />
                        ) : null
                    }

                    <MenuDivider />

                    <MenuItem
                        text="View in browser"
                        onClick={actions.openExternal.bind(this, track.permalink_url)} />
                    <ShareMenuItem title={track.title} permalink={track.permalink_url} username={track.user.username} />

                </Menu>
            )} position={Position.BOTTOM_LEFT}>
                <a href="javascript:void(0)">
                    <i className="icon-more_horiz" />
                </a>
            </Popover>
        )
    }
}

ActionsDropdown.propTypes = {
    liked: PropTypes.bool.isRequired,
    reposted: PropTypes.bool.isRequired,
    track: PropTypes.object.isRequired,
    playlist_objects: PropTypes.object.isRequired,
    playlists: PropTypes.array.isRequired,
    index: PropTypes.number,

    addUpNext: PropTypes.func.isRequired,
    toggleLike: PropTypes.func.isRequired,
    toggleRepost: PropTypes.func.isRequired,
    togglePlaylistTrack: PropTypes.func.isRequired

}

ActionsDropdown.defaultProps = {
    index: null
}

const mapStateToProps = (state, { track }) => {
    const { auth: { playlists, likes, reposts }, entities, objects } = state
    const { playlist_entities } = entities

    const playlist_objects = objects[OBJECT_TYPES.PLAYLISTS] || {}

    const liked = SC.hasID(track.id, (track.kind === 'playlist' ? likes.playlist : likes.track))
    const reposted = SC.hasID(track.id, reposts)

    return {
        playlists: playlists.map(id => playlist_entities[id]),
        playlist_objects,
        liked, reposted

    }
}

export default connect(mapStateToProps, actions)(ActionsDropdown)