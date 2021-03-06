import classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { NormalizedResult, SoundCloud } from '../../../../../types';
import TextShortener from '../../../../_shared/TextShortener';
import { StoreState } from '@common/store';
import { getDenormalizedEntities } from '@common/store/entities/selectors';
import { getCurrentPlaylistId } from '@common/store/player/selectors';
import { PlayerStatus } from '@common/store/player';
import * as styles from '../Sidebar.module.scss';

interface OwnProps {
    items: Array<NormalizedResult>;
}


type PropsFromState = ReturnType<typeof mapStateToProps>;

type AllProps = OwnProps & PropsFromState;

const SideBarPlaylist = React.memo<AllProps>(({ playlists, currentPlaylistId, isActuallyPlaying }) => {

    const isPlaying = (playlistId: number) => currentPlaylistId && playlistId.toString() === currentPlaylistId;

    return (
        <>
            {
                playlists.map((playlist: SoundCloud.Playlist) => (
                    <div
                        key={`sidebar-${playlist.id}`}
                        className={classNames(styles.navItem, {
                            isCurrentPlaylist: isPlaying(playlist.id),
                            isActuallyPlaying
                        })}
                    >
                        <NavLink
                            to={`/playlist/${playlist.id}`}
                            className={styles.navLink}
                            activeClassName='active'
                        >
                            <TextShortener text={playlist.title} />
                        </NavLink>
                    </div>
                ))
            }
        </>
    );
});

const mapStateToProps = (state: StoreState, props: OwnProps) => {
    const { items } = props;
    const { player: { status } } = state;

    return {
        playlists: getDenormalizedEntities<SoundCloud.Playlist>(items)(state),
        currentPlaylistId: getCurrentPlaylistId(state),
        isActuallyPlaying: status === PlayerStatus.PLAYING
    };
};

export default connect<PropsFromState, {}, OwnProps, StoreState>(mapStateToProps)(SideBarPlaylist);
