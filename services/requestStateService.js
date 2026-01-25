const StateTransition = require("../models/StateTransition");

const allowedTransitions = {
  submitted: ["awaiting_lawyer", "expired", "cancelled"],
  awaiting_lawyer: ["accepted", "expired"],
  accepted: [],
};

async function transitionRequest({ request, toState, userId }) {
  const fromState = request.status;

  if (!allowedTransitions[fromState]?.includes(toState)) {
    throw new Error(`Invalid request transition: ${fromState} → ${toState}`);
  }

  request.status = toState;
  await request.save();

  await StateTransition.create({
    entity_type: "request",
    entity_id: request._id,
    from_state: fromState,
    to_state: toState,
    triggered_by: userId
  });
}

module.exports = { transitionRequest };
