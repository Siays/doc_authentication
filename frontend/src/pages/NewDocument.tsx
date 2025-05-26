import { usePageTitles } from "../hooks/usePageTitle";

export default function NewDocument():React.ReactElement{
    usePageTitles("New Document", "New Document Page");
    return (
        <>
        </>
    );
}