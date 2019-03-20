angular
.module('YoutubeHistoryApp', [])
.controller('YoutubeHistoryCtrl', ['$scope', '$element', ($scope, $element) => {
	$scope.sinceDate = (date) => moment(date).from();
	$scope.history = [];
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
			$scope.history = parseYoutubeHistory(data);
			$scope.$apply();
		};
		reader.readAsText(event.dataTransfer.files[0]);
	});
}]);

function parseYoutubeHistory(data) {
	return data.flatMap((event) => {
		if (!event.title.startsWith('Watched ')) {
			return [];  // Not a watch event.
		}
		if (!event.titleUrl || !event.subtitles) {
			return []; // Video deleted, private, or a story.
		}
		return {
			'title': event.title.slice(8),
			'url': event.titleUrl,
			'id': event.titleUrl.split('=')[1],
			'channel': event.subtitles[0].name,
			'date': event.time,
		};
	});
}
