"use client";

import { Spinner } from "flowbite-react";
import { loaderTheme } from "./componentTheme/LoaderTheme";

const Loader = () => {
  return (
    <div className="container">
      <div className="flex flex-wrap gap-2 justify-center items-center">
        <Spinner
          aria-label="Center-aligned spinner example"
          className="text-center"
          size={"md"}
          color={"#005baa"}
          theme={loaderTheme}
        />
      </div>
    </div>
  );
};
export default Loader;
