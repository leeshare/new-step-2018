import React from 'react';
class AudioPlayer extends React.Component {

    constructor(props) {
        super(props)
        this.state = { audioUrl: '' }
    }
    play(audioUrl) {
        this.refs.audio.pause();//暂停当前
        this.setState({
            audioUrl: (audioUrl || '')
        });
        setTimeout(() => {
            this.refs.audio.play();
        }, 100);
    }
    componentDidMount() {
        var audio = this.refs.audio;
        audio.addEventListener('play', this.play);
        audio.addEventListener('pause', this.pause);
    }

    render() {
        return <audio ref="audio" src={this.state.audioUrl}>
            Your browser does not support the audio element.
                    </audio>;
    }
}

export default AudioPlayer;
