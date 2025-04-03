import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { QuestionMarkCircleIcon, DocumentTextIcon, LinkIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { NodeType } from './types';

interface AddNodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddNode: (type: NodeType) => void;
    sourceNodeId: string | null;
}

export const AddNodeModal: React.FC<AddNodeModalProps> = ({ isOpen, onClose, onAddNode, sourceNodeId }) => {

    const handleAdd = (type: NodeType) => {
        onAddNode(type);
        onClose(); // Close modal after adding
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-30" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-50" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                                >
                                    <span>Add New Node</span>
                                     <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent p-1 text-sm font-medium text-gray-500 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                        onClick={onClose}
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </Dialog.Title>
                                <div className="mt-4 space-y-3">
                                    <p className="text-sm text-gray-500">
                                        Choose the type of node to add as a child of node <span className="font-mono bg-gray-100 px-1 rounded">{sourceNodeId || 'N/A'}</span>.
                                    </p>

                                    <button
                                        type="button"
                                        className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-sky-100 px-4 py-2 text-sm font-medium text-sky-900 hover:bg-sky-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                                        onClick={() => handleAdd('user-question')}
                                    >
                                        <QuestionMarkCircleIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                        User Question
                                    </button>

                                    <button
                                        type="button"
                                        className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-purple-100 px-4 py-2 text-sm font-medium text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                                        onClick={() => handleAdd('user-file')}
                                    >
                                         <DocumentTextIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                        Upload File
                                    </button>

                                    <button
                                        type="button"
                                        className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-orange-100 px-4 py-2 text-sm font-medium text-orange-900 hover:bg-orange-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                                        onClick={() => handleAdd('user-webpage')}
                                    >
                                        <LinkIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                        Fetch Webpage
                                    </button>
                                </div>

                                {/* <div className="mt-5 sm:mt-6">
                                    <button
                                        type="button"
                                        className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
                                        onClick={onClose}
                                    >
                                        Cancel
                                    </button>
                                </div> */}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};