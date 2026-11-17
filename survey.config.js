// 질문이나 선택지를 바꾸면 id도 새 값으로 바꾸세요. 새 id는 빈 결과로 시작합니다.
export const survey = {
  id: 'meeting-attendance-live-v1',
  question: '오늘 모임에 참석하시나요?',
  description: '가장 가까운 답변 하나를 선택해 주세요.',
  options: [
    { id: 'yes', label: '참석해요' },
    { id: 'maybe', label: '아직 모르겠어요' },
    { id: 'no', label: '참석하지 못해요' },
  ],
};
