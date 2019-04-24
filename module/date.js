module.exports = function formatDate(date) {
  return (
    date.getFullYear() +
    "년 " +
    (date.getMonth() + 1) +
    "월 " +
    date.getDate() +
    "일 " +
    date.getHours() +
    "시 " +
    date.getMinutes() +
    "분"
  );
};
