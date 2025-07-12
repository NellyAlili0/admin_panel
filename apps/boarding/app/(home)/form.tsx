"use client";
import React, { useState, useEffect, useActionState, useRef } from "react";
import { onboard } from "./actions";
import { Loader } from "lucide-react";
import { useSearchParams } from "next/navigation";

export const initialState = {
  message: "",
};

interface School {
  id: number;
  name: string;
}

function Form({
  current_school,
  schools,
}: {
  current_school: string;
  schools: School[];
}) {
  const [state, formAction, pending] = useActionState<
    { message: string },
    FormData
  >(onboard, initialState);

  const [errMsg, setErrMsg] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [filteredSchools, setFilteredSchools] = useState<School[]>(schools);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const errorFromQuery = searchParams.get("error");

  useEffect(() => {
    if (state.message) {
      setErrMsg(state.message);
    } else if (errorFromQuery) {
      setErrMsg(errorFromQuery);
    } else {
      setErrMsg("");
    }
  }, [state, errorFromQuery]);

  useEffect(() => {
    if (inputValue.trim() === "") {
      setFilteredSchools([]);
      return;
    }

    const results = schools.filter((school) =>
      school.name.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredSchools(results);
  }, [inputValue, schools]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setFilteredSchools([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <section className="p-3">
      <div className="max-w-xl mx-auto my-10 bg-white shadow rounded-xl">
        <section className="form_heading mb-3 bg-[#1c98ed]">
          <h1 className="text-xl md:text-2xl font-bold text-center py-5 text-white">
            Information Form
          </h1>
        </section>
        <form
          className="space-y-4 form_className px-8 py-6"
          id="carpool_form"
          action={formAction}
        >
          {errMsg && (
            <div className="bg-red-200 px-6 py-4 my-4 rounded-md text-sm flex items-center mx-auto max-w-lg">
              <svg
                viewBox="0 0 24 24"
                className="text-red-600 w-5 h-5 sm:w-5 sm:h-5 mr-3"
              >
                <path
                  fill="currentColor"
                  d="M11.983,0a12.206,12.206,0,0,0-8.51,3.653A11.8,11.8,0,0,0,0,12.207,11.779,11.779,0,0,0,11.8,24h.214A12.111,12.111,0,0,0,24,11.791h0A11.766,11.766,0,0,0,11.983,0ZM10.5,16.542a1.476,1.476,0,0,1,1.449-1.53h.027a1.527,1.527,0,0,1,1.523,1.47,1.475,1.475,0,0,1-1.449,1.53h-.027A1.529,1.529,0,0,1,10.5,16.542ZM11,12.5v-6a1,1,0,0,1,2,0v6a1,1,0,1,1-2,0Z"
                ></path>
              </svg>
              <span className="text-red-800">{errMsg}</span>
            </div>
          )}

          <section className="space-y-5">
            <div>
              <label
                htmlFor="parent_name"
                className="block text-base font-medium text-gray-700"
              >
                Parent Name:
              </label>
              <input
                type="text"
                id="parent_name"
                name="parent_name"
                required
                className="w-full p-1 focus:outline-none text-sm shadow-xs border border-gray-100 py-3 px-2 mt-2 focus:border-gray-400 rounded"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label
                htmlFor="parent_email"
                className="block text-base font-medium text-gray-700"
              >
                Parent Email:
              </label>
              <input
                type="email"
                id="parent_email"
                name="parent_email"
                required
                className="w-full p-1 focus:outline-none text-sm shadow-xs border border-gray-100 py-3 px-2 mt-2 focus:border-gray-400 rounded"
                placeholder="janedoe@gmail.com"
              />
            </div>
            <div>
              <label
                htmlFor="parent_phone"
                className="block text-base font-medium text-gray-700"
              >
                Parent Phone:
              </label>
              <input
                type="tel"
                id="parent_phone"
                name="parent_phone"
                className="w-full p-1 focus:outline-none text-sm shadow-xs border border-gray-100 py-3 px-2 mt-2 focus:border-gray-400 rounded"
                placeholder="071234567"
                required
              />
            </div>
            <div>
              <label
                htmlFor="address"
                className="block text-base font-medium text-gray-700"
              >
                Address:
              </label>
              <input
                type="text"
                id="address"
                name="address"
                className="w-full p-1 focus:outline-none text-sm shadow-xs border border-gray-100 py-3 px-2 mt-2 focus:border-gray-400 rounded"
                placeholder="apartment 1234, parklands"
                required
              />
            </div>
            <div>
              <label
                htmlFor="student_name"
                className="block text-base font-medium text-gray-700"
              >
                Student Name:
              </label>
              <input
                type="text"
                id="student_name"
                name="student_name"
                required
                className="w-full p-1 focus:outline-none text-sm shadow-xs border border-gray-100 py-3 px-2 mt-2 focus:border-gray-400 rounded"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label
                htmlFor="student_gender"
                className="block text-base font-medium text-gray-700"
              >
                Student Gender:
              </label>
              <select
                id="student_gender"
                name="student_gender"
                required
                className="w-full p-1 focus:outline-none text-sm shadow-xs border border-gray-100 py-3 px-2 mt-2 focus:border-gray-400 rounded"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="ride_type"
                className="block text-base font-medium text-gray-700"
              >
                Ride Type:
              </label>
              <select
                id="ride_type"
                name="ride_type"
                required
                className="w-full p-1 focus:outline-none text-sm shadow-xs border border-gray-100 py-3 px-2 mt-2 focus:border-gray-400 rounded"
              >
                <option value="">Select Ride Type</option>
                <option value="pickup">pickup</option>
                <option value="dropoff">dropoff</option>
                <option value="pickup & dropoff">pickup and dropoff</option>
              </select>
            </div>

            {current_school !== "" ? (
              <input
                type="hidden"
                name="current_school"
                value={current_school}
              />
            ) : (
              <div className="relative" ref={wrapperRef}>
                <label
                  htmlFor="current_school"
                  className="block text-base font-medium text-gray-700"
                >
                  School:
                </label>
                <input
                  type="text"
                  id="current_school"
                  name="current_school"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  required
                  autoComplete="off"
                  className="w-full p-1 focus:outline-none text-sm shadow-xs border border-gray-100 py-3 px-2 mt-2 focus:border-gray-400 rounded"
                  placeholder="Start typing your school name..."
                />
                {inputValue.length > 0 && filteredSchools.length > 0 && (
                  <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded shadow max-h-48 overflow-y-auto">
                    {filteredSchools.map((school) => (
                      <li
                        key={school.id}
                        onMouseDown={(e) => {
                          e.preventDefault(); // prevents input blur before value is set
                          setInputValue(school.name);
                          setFilteredSchools([]);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      >
                        {school.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>

          <div id="home-area-suggestions" className="z-10 relative"></div>

          <section>
            <label
              htmlFor="pickup"
              className="block text-base font-medium text-gray-700"
            >
              Pickup (pickup from home):
            </label>
            <input
              type="time"
              id="pickup"
              name="pickup"
              className="w-full p-1 focus:outline-none text-sm shadow-xs border border-gray-100 py-3 px-2 mt-2 focus:border-gray-400 rounded"
              placeholder="7:00"
              required
            />
          </section>
          <section>
            <label
              htmlFor="dropoff"
              className="block text-base font-medium text-gray-700"
            >
              Dropoff (dropoff from school):
            </label>
            <input
              type="time"
              id="dropoff"
              name="dropoff"
              required
              className="w-full p-1 focus:outline-none text-sm shadow-xs border border-gray-100 py-3 px-2 mt-2 focus:border-gray-400 rounded"
              placeholder="17:00"
            />
          </section>
          <section>
            <label
              htmlFor="start_date"
              className="block text-base font-medium text-gray-700"
            >
              Start_Date(school opening date):
            </label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              className="w-full p-1 focus:outline-none text-sm shadow-xs border border-gray-100 py-3 px-2 mt-2 focus:border-gray-400 rounded"
              placeholder="7/7/2025"
            />
          </section>
          <section>
            <label
              htmlFor="mid_term"
              className="block text-base font-medium text-gray-700"
            >
              Mid_Term(school mid term)
            </label>
            <input
              type="date"
              id="mid_term"
              name="mid_term"
              className="w-full p-1 focus:outline-none text-sm shadow-xs border border-gray-100 py-3 px-2 mt-2 focus:border-gray-400 rounded"
              placeholder="7/7/2025"
            />
          </section>
          <section>
            <label
              htmlFor="end_date"
              className="block text-base font-medium text-gray-700"
            >
              End_Date( school closing date)
            </label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              className="w-full p-1 focus:outline-none text-sm shadow-xs border border-gray-100 py-3 px-2 mt-2 focus:border-gray-400 rounded"
              placeholder="7/7/2025"
            />
          </section>

          <button
            type="submit"
            id="carpool_btn"
            disabled={pending ? true : false}
            className="cursor-pointer w-full mt-3 bg-[#1c98ed] text-white py-2 rounded hover:bg-[#47a5e3] flex items-center justify-center"
          >
            {pending ? <Loader className="animate-spin" /> : "Submit"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default Form;
