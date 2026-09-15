import { permanentRedirect } from "next/navigation";

/** Keep the old URL useful without exposing internal project records. */
export default function Changelog() {
  permanentRedirect("/lab");
}
