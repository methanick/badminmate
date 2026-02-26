import { MatchPublicView } from "@/components/match-public-view";

export default async function MatchPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return <MatchPublicView sessionId={sessionId} />;
}
