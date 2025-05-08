import AgePyramid from "@/components/AgePyramid";

export default function HomePage() {
  return (
    <div className="nso_container">
      <div>
        <h1 className="text-2xl font-bold mb-4">
          Монгол Улсын хүн амын нас, хүйсийн суварга
        </h1>
        <div className="w-full">
          <AgePyramid />
        </div>
      </div>
    </div>
  );
}
