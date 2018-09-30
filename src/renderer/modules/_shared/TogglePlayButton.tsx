import React from "react";
import { connect } from "react-redux";
import { StoreState } from '../../../shared/store';
import { PlayerStatus, toggleStatus } from '../../../shared/store/player';
import { bindActionCreators, Dispatch } from 'redux';

interface OwnProps {
    className?: string;
}

interface PropsFromState {
    status: PlayerStatus;
}

interface PropsFromDispatch {
    toggleStatus: typeof toggleStatus;
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

class TogglePlayButton extends React.Component<AllProps> {

    togglePlay = (event: React.MouseEvent<HTMLAnchorElement>) => {
        const { toggleStatus, status } = this.props;

        event.preventDefault();
        event.nativeEvent.stopImmediatePropagation();

        if (status !== PlayerStatus.PLAYING) {
            toggleStatus(PlayerStatus.PLAYING);
        } else if (status === PlayerStatus.PLAYING) {
            toggleStatus(PlayerStatus.PAUSED);
        }

    }

    render() {
        const { status, className } = this.props;

        let icon = "";

        switch (status) {
            // case PlayerStatus.ERROR:
            //     icon = "icon-alert-circle";
            //     break;
            case PlayerStatus.PLAYING:
                icon = "pause";
                break;
            case PlayerStatus.PAUSED:
            case PlayerStatus.STOPPED:
                icon = "play_arrow";
                break;
            // case PlayerStatus.LOADING:
            //     icon = "more_horiz";
            //     break;
            default:
                break;
        }

        return (
            <a href="javascript:void(0)" className={className}
                onClick={this.togglePlay}>
                <i className={`icon-${icon}`} />
            </a>
        );
    }
}

const mapStateToProps = ({ player: { status } }: StoreState): PropsFromState => ({
    status,
})


const mapDispatchToProps = (dispatch: Dispatch<any>): PropsFromDispatch => bindActionCreators({
    toggleStatus
}, dispatch);

export default connect<PropsFromState, PropsFromDispatch, OwnProps, StoreState>(mapStateToProps, mapDispatchToProps)(TogglePlayButton);
