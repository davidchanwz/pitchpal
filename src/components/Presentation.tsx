import DocViewer, { DocViewerRenderers } from "react-doc-viewer";


interface PresentationProps {
    presentationLink: string;
    avatar?: string;
}

export default function Presentation({ presentationLink, avatar }: PresentationProps) {
  const docs = [
    {
      uri: "https://pitchpal.deploy.jensenhshoots.com/slides/sample.pptx",
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
