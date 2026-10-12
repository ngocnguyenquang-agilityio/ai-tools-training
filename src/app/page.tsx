import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Tech News</h1>

      {/* Temporary shadcn check; replaced by the story list in #6. */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Sample story</CardTitle>
          <CardDescription>shadcn/ui is set up</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">Sample</Badge>
        </CardContent>
      </Card>
    </main>
  );
}
