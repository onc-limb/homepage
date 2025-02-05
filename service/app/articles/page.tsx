import Link from "next/link"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
  } from "@/components/ui/pagination"

export default function Component() {
  return (
    <section className="w-full py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Our Latest Blog Posts</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Discover the latest insights, trends, and news from our expert writers.
            </p>
          </div>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-12">
          <Link
            href="#"
            className="group flex flex-col bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            prefetch={false}
          >
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Category</span>
              </div>
              <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                The Future of Web Development: Trends and Innovations
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>John Doe</span>
                <span>&middot;</span>
                <span>May 15, 2023</span>
              </div>
              <p className="text-muted-foreground line-clamp-3">
                Explore the latest trends and innovations shaping the future of web development, from AI-powered tools
                to the rise of serverless architectures.
              </p>
            </div>
          </Link>
          <Link
            href="#"
            className="group flex flex-col bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            prefetch={false}
          >
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Category</span>
              </div>
              <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                Mastering the Art of Responsive Web Design
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Jane Smith</span>
                <span>&middot;</span>
                <span>April 28, 2023</span>
              </div>
              <p className="text-muted-foreground line-clamp-3">
                Learn the essential techniques and best practices for creating responsive websites that adapt seamlessly
                to various devices and screen sizes.
              </p>
            </div>
          </Link>
          <Link
            href="#"
            className="group flex flex-col bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            prefetch={false}
          >
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Category</span>
              </div>
              <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                Unleashing the Power of React: A Comprehensive Guide
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Michael Johnson</span>
                <span>&middot;</span>
                <span>March 10, 2023</span>
              </div>
              <p className="text-muted-foreground line-clamp-3">
                Dive deep into the world of React, the popular JavaScript library for building user interfaces, and
                learn how to create dynamic and efficient web applications.
              </p>
            </div>
          </Link>
          <Link
            href="#"
            className="group flex flex-col bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            prefetch={false}
          >
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Category</span>
              </div>
              <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                Accessibility in Web Design: Creating Inclusive Experiences
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Emily Davis</span>
                <span>&middot;</span>
                <span>February 22, 2023</span>
              </div>
              <p className="text-muted-foreground line-clamp-3">
                Explore the principles of accessible web design and learn how to create websites that are inclusive and
                user-friendly for individuals with disabilities.
              </p>
            </div>
          </Link>
          <Link
            href="#"
            className="group flex flex-col bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            prefetch={false}
          >
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Category</span>
              </div>
              <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                Optimizing Website Performance: Strategies and Tools
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>David Lee</span>
                <span>&middot;</span>
                <span>January 5, 2023</span>
              </div>
              <p className="text-muted-foreground line-clamp-3">
                Learn effective techniques and utilize powerful tools to optimize the performance of your website,
                ensuring a fast and seamless user experience.
              </p>
            </div>
          </Link>
          <Link
            href="#"
            className="group flex flex-col bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            prefetch={false}
          >
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Category</span>
              </div>
              <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                The Rise of Headless CMS: Revolutionizing Content Management
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Sarah Kim</span>
                <span>&middot;</span>
                <span>December 15, 2022</span>
              </div>
              <p className="text-muted-foreground line-clamp-3">
                Explore the benefits of headless CMS and learn how to leverage this innovative approach to content
                management for your web projects.
              </p>
            </div>
          </Link>
        </div>
        <div className="flex justify-center mt-12">
        <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
        </div>
      </div>
    </section>
  )
}