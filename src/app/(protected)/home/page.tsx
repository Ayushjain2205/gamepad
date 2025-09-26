import { Page } from "@/components/PageLayout";

export default async function Home() {
  return (
    <>
      <Page.Header className="p-0">Home page</Page.Header>
      <Page.Main className="flex flex-col items-center justify-start gap-4 mb-16">
        Hello
      </Page.Main>
    </>
  );
}
