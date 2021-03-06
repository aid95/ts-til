import { FxSQL_DEBUG, PostgreSQL } from "fxsql";
import { dbEnv } from "../src/config/db.init";
import { go, take1, mapL, flatten } from "fxjs";

describe("Course Tests", () => {
  let p;

  beforeAll(function () {
    FxSQL_DEBUG.LOG = true;

    const { CONNECT } = PostgreSQL;
    p = CONNECT(dbEnv);
  });

  afterAll(function () {
    p.END();
  });

  test("특정 강의명을 가진 강의를 조회한다.", async () => {
    // given
    const title = "Aut modi voluptates incidunt aut ut officia adipisci.";

    // when
    const [result] = await go(
      p.QUERY`SELECT ${p.CL("id")} FROM ${p.TB("courses")} WHERE ${p.EQ({
        title,
      })}`,
      mapL(({ id }) => id),
      take1
    );

    // then
    expect(result).toBe(1);
  });

  describe("강의를 조회한다.", () => {
    test("열린 강의를 조회한다.", async () => {
      // given

      // when
      const result = await go(
        p.QUERY`SELECT ${p.CL("id")} FROM ${p.TB("courses")} WHERE ${p.EQ({
          status: "OPEN",
        })}`
      );

      // then
      expect(result.length).toBe(5);
    });

    test("열린 강의들의 수강생 수를 조회한다.", async () => {
      // given

      // when
      const [result] = await go(
        p.QUERY`
        select *
        from
          (select * from courses where status = 'OPEN' and deleted_at is null) c
          inner join instructors i on c.instructor_id = i.id
          inner join categories ct on c.category_id = ct.id
          left join (
            select course_id, count(course_id) as total_students
            from
              subscribe_courses sc
              inner join users u on sc.user_id = u.id and u.deleted_at is null
            group by course_id) ts on c.id = ts.course_id and c.id = ts.course_id
        order by ts.total_students`,
        mapL(({ total_students }) => total_students),
        take1
      );

      // then
      expect(+result).toBe(1);
    });
  });

  test("Polymorphic", async () => {
    const result = await p.ASSOCIATE`
      courses ${p.SQL`where status = 'OPEN' limit 5`}
        - instructors 
          p - photos
        p < photos
      `;
  });

  test("Hook 테스트", async () => {
    const [row] = await p.ASSOCIATE`
      courses ${{
        hook: (courses) =>
          courses.map((course) =>
            Object.assign({}, course, { _popular: true })
          ),
      }}
    `;

    expect(row).toHaveProperty("_popular");
  });

  test("Option", async () => {
    const courses = await p.ASSOCIATE`
      courses ${{ row_number: [10, p.SQL`id DESC`] }}
        - instructor ${{
          left_key: "instructor_id",
          key: "id",
          table: "instructors",
        }}
        x users ${{
          key: "id",
          xkey: "user_id",
          left_key: "id",
          left_xkey: "course_id",
          xtable: "subscribe_courses",
        }}
    `;
  });
});
