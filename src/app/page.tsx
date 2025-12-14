import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function Home() {
  return (
    <div className="">
      <Input />
      <Button variant={"primary"} size={"lg"}>
        Primary
      </Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant={"destructive"}>Destructive</Button>
      <Button variant={"ghost"}>Ghost</Button>
      <Button variant="muted">Muted</Button>
      <Button variant={"outline"}>Outline</Button>
      <Button variant={"teritary"}>Teritary</Button>
    </div>
  );
}
