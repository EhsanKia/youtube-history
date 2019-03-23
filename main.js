angular
.module('YoutubeHistoryApp', [])
.controller('YoutubeHistoryCtrl', ['$scope', '$element', ($scope, $element) => {
	$scope.date = moment;
	$scope.history = loadHistory();
	$scope.query = '';

	// Set file drop event listeners
	const dropZone = angular.element(document.querySelector('#drop_zone'));
	$element.on('drag dragstart dragover dragenter dragend drop dragleave', (e) => {
		e.preventDefault();
	});
	$element.on('drag dragstart dragenter', () => dropZone.addClass('is-dragover'))
	$element.on('drop dragend dragleave', () => dropZone.removeClass('is-dragover'))
	$element.on('drop', (e) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const data = JSON.parse(e.target.result);
			$scope.history = parseHistory(data);
			saveHistory($scope.history);
			$scope.$apply();
		};
		reader.readAsText(event.dataTransfer.files[0]);
	});

	$scope.clearHistory = () => {
		delete window.localStorage.youtubeHistory;
		$scope.history = [];
	}
}]);

function parseHistory(data) {
	return data.flatMap((event) => {
		if (event.header.toLowerCase() !== 'youtube') {
			return [];  // Not a Youtube event.
		}
		if (!event.title.startsWith('Watched ')) {
			return [];  // Not a video watch event.
		}
		if (!event.titleUrl || !event.subtitles) {
			return []; // Video deleted, private, or a story.
		}
		return {
			'title': event.title.slice(8),
			'url': event.titleUrl,
			'id': event.titleUrl.split('=')[1],
			'channel': event.subtitles[0].name,
			'channelUrl': event.subtitles[0].url,
			'date': event.time,
		};
	});
}

function saveHistory(history) {
	const storage = history.map((video) => {
		return [
			video.title,
			video.id,
			video.channel,
			video.channelUrl.split('/').pop(),
			video.date,
		];
	});
	window.localStorage.youtubeHistory = JSON.stringify(storage);
}

function loadHistory() {
	if (!window.localStorage.youtubeHistory) return [];
	const storage = JSON.parse(window.localStorage.youtubeHistory);
	return storage.map((item) => {
		return {
			'title': item[0],
			'url': `https://www.youtube.com/watch?v=${item[1]}`,
			'id': item[1],
			'channel': item[2],
			'channelUrl': `https://www.youtube.com/channel/${item[3]}`,
			'date': item[4],
		};
	})
}