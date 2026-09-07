export const PEER_EVAL_CRITERIA = [
  { key: "posture", label: "Posture" },
  { key: "amplitude", label: "Amplitude" },
  { key: "controle", label: "Contrôle" },
  { key: "securite", label: "Sécurité" }
];

export const createPeerEvalState = () => ({
  posture: null,
  amplitude: null,
  controle: null,
  securite: null
});

export const isPeerEvalComplete = (evaluation) => {
  return PEER_EVAL_CRITERIA.every(({ key }) => evaluation[key] !== null);
};

export const computePeerEvalScore = (evaluation) => {
  const success = PEER_EVAL_CRITERIA.filter(({ key }) => evaluation[key] === true).length;
  return Math.round((success / PEER_EVAL_CRITERIA.length) * 100);
};
