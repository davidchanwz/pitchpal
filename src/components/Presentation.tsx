import DocViewer, { DocViewerRenderers } from "react-doc-viewer";


interface PresentationProps {
    presentationLink: string;
}

export default function Presentation({ presentationLink }: PresentationProps) {
  const docs = [
    {
      uri: presentationLink,
      type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    },
  ];

  return (
    <div>
      <DocViewer
        pluginRenderers={DocViewerRenderers}
        documents={docs}
        className="w-screen h-screen"
        config={{
          header: {
            disableHeader: true,
            disableFileName: true,
            retainURLParams: true,
          },
        }}
      />
      ;
    </div>
  );
}
