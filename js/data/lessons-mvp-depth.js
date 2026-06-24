/** 补充 helper：getLessonVocab 从 LESSONS_MVP 或 supplement 取词 */
function getLessonVocab(lessonId) {
  var id = Number(lessonId);
  var lesson = (typeof LESSONS_MVP !== "undefined" ? LESSONS_MVP : []).find(function(l) { return l.lessonId === id; });
  if (lesson && lesson.vocab && lesson.vocab.length) return lesson.vocab;
  if (typeof LESSONS_SUPPLEMENT_MVP !== "undefined") {
    var sup = LESSONS_SUPPLEMENT_MVP.find(function(l) { return l.lessonId === id; });
    if (sup && sup.vocab && sup.vocab.length) return sup.vocab;
  }
  return [];
}
function getLessonDialogues(lessonId) {
  var id = Number(lessonId);
  var lesson = (typeof LESSONS_MVP !== "undefined" ? LESSONS_MVP : []).find(function(l) { return l.lessonId === id; });
  return (lesson && lesson.dialogues) ? lesson.dialogues : [];
}
function getLessonCoachSummary(lessonId) { return null; }
function getLessonDifficultVocabHints(lessonId) { return null; }
var DEPTH_PARSE_HINTS = {};
var QUIZ_OPTION_KANA = {};