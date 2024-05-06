package main

import (
	"back/database"
	"back/graph"
	"flag"
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

const defaultPort = "1323"

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}
	flag.Parse()

	_, err := database.SetupDB()
	if err != nil {
		panic("failed to connect database")
	}

	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{echo.GET, echo.POST, echo.OPTIONS},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
	}))

	e.GET("/", welcome())

	graphqlHandler := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{}}))
	playgroundHandler := playground.Handler("GraphQL", "/graphql")

	e.GET("/playground", func(c echo.Context) error {
		playgroundHandler.ServeHTTP(c.Response(), c.Request())
		return nil
	})
	e.POST("/graphql", func(c echo.Context) error {
		graphqlHandler.ServeHTTP(c.Response(), c.Request())
		return nil
	})

	log.Printf("connect to http://localhost:%s/playground for GraphQL playground", port)
	log.Fatalln(e.Start(":" + port))
}

func welcome() echo.HandlerFunc {
	return func(c echo.Context) error {
		return c.String(http.StatusOK, "Welcome!")
	}
}
