import * as did from "@d-id/client-sdk";

export async function createDidAgent(
  clientKey: string,
  agentId: string,
  videoElement: HTMLVideoElement
) {
  const auth = {
    type: "key" as const,
    clientKey,
  };

  // Video settings
  videoElement.autoplay = true;
  videoElement.playsInline = true;
  videoElement.muted = true;

  const callbacks = {
    onSrcObjectReady(srcObject: MediaStream) {
      console.log("✅ Video Stream Received");
      videoElement.srcObject = srcObject;
    },

    onConnectionStateChange(state: any) {
      console.log("D-ID State:", state);
    },
    onNewMessage(messages: any) {
      console.log("FULL MESSAGE:", JSON.stringify(messages, null, 2));
    },
  };
  console.log("Using Agent ID:", agentId);
  const agent = await did.createAgentManager(agentId, {
    auth,
    callbacks,
  });

  await agent.connect();

  console.log("Agent Object:", agent);

  return agent;
}