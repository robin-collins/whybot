import { useState, Dispatch, SetStateAction, useEffect, ReactDOM } from "react";
import "./index.css";
import Dropdown from "./Dropdown";
import { PERSONAS } from "./personas";
import { MODELS } from "./models";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

type SidebarButtonProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
};

export const SidebarButton = (props: SidebarButtonProps) => {
  // console.log("function SidebarButton started");
  // console.log("function SidebarButton finished");
  return (
    <button
      onClick={props.toggleSidebar}
      className="h-12 w-12 p-2 text-white/50 hover:text-white/80"
    >
      {props.isOpen ? (
        // Left chevron
        <ChevronLeftIcon className="h-8 w-8" />
      ) : (
        // Hamburger menu
        <svg
          className="h-8 w-8"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
        </svg>
      )}
    </button>
  );
};

type SidebarProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
  persona: string;
  model: string;
  onSetPersona: (persona: string) => void;
  onSetModel: (model: string) => void;
};
export const Sidebar = (props: SidebarProps) => {
  // console.log("function Sidebar started");
  // console.log("function Sidebar finished");
  return (
    <div
      className={`fixed z-30 inset-y-0 left-0 transform ${
        props.isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-400 ease-in-out w-80 bg-zinc-800 p-8`}
    >
      <div className="absolute top-0 right-0 -mr-16 p-1">
        <SidebarButton
          isOpen={props.isOpen}
          toggleSidebar={props.toggleSidebar}
        />
      </div>
      <div className="text-gray-300">
        <span className="text-xl">Settings</span>
      </div>
      <nav className="mt-5 flex">
        <div className="flex flex-col py-2 justify-between">
          <div className="h-15">Persona:</div>
          <div className="h-15">Model:</div>
        </div>
        <div className="flex flex-col ml-4">
          <Dropdown
            className="w-48 mb-4"
            value={props.persona}
            options={Object.entries(PERSONAS).map(([k, v]) => {
              return { value: k, name: v.name, popup: v.description };
            })}
            onChange={props.onSetPersona}
          />
          <Dropdown
            className="w-48"
            value={props.model}
            options={Object.entries(MODELS).map(([k, v]) => {
              return { value: k, name: v.name, popup: v.description };
            })}
            onChange={props.onSetModel}
          />
        </div>
      </nav>
    </div>
  );
};
